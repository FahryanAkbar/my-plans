import { v } from "convex/values";
import { query } from "./_generated/server";
import { 
  getCurrentUserOrThrow, 
  getProjectMember 
} from "../lib/utils/rbac";
import { Id } from "./_generated/dataModel";

type Period = "daily" | "weekly" | "monthly";

type StatEntry = {
  created: number;
  completed: number;
  label: string;
  timestamp: number;
};

// Returns "YYYY-MM-DD" in **local** timezone (avoids UTC offset mismatches)
function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildStatBuckets(period: Period): Record<string, StatEntry> {
  const now = new Date();

  const stats: Record<string, StatEntry> = {};
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (period === "daily") {
    // Generate 24 hourly buckets so tooltip can hover over any hour.
    const today = new Date();
    const dateStr = localDateStr(today);
    for (let slotHour = 0; slotHour <= 23; slotHour += 1) {
      const label =
        slotHour === 0 ? "12am"
        : slotHour < 12 ? `${slotHour}am`
        : slotHour === 12 ? "12pm"
        : `${slotHour - 12}pm`;
      const key = `${dateStr}T${String(slotHour).padStart(2, "0")}`;
      const d = new Date(today);
      d.setHours(slotHour, 0, 0, 0);
      stats[key] = { created: 0, completed: 0, label, timestamp: d.getTime() };
    }
  } else if (period === "weekly") {
    // Last 7 days — use local date so the day label matches the user's timezone
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const label = days[d.getDay()];
      const key = localDateStr(d);
      stats[key] = { created: 0, completed: 0, label, timestamp: d.getTime() };
    }
  } else {
    // Last 30 days grouped by week (4 buckets)
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const label = `${months[weekStart.getMonth()]} ${weekStart.getDate()}`;
      const key = localDateStr(weekStart);
      stats[key] = {
        created: 0,
        completed: 0,
        label,
        timestamp: weekStart.getTime(),
      };
    }
  }
  return stats;
}

function getTaskKey(timestamp: number, period: Period): string {
  const d = new Date(timestamp);
  if (period === "daily") {
    // getHours() returns LOCAL hour — snap to the exact hour
    const hour = d.getHours();
    return `${localDateStr(d)}T${String(hour).padStart(2, "0")}`;
  }
  // Weekly & monthly: group by local date
  return localDateStr(d);
}

function bucketMonthlyTasks(
  stats: Record<string, StatEntry>,
  tasks: { createdAt: number; completedAt?: number | null }[]
) {
  const buckets = Object.entries(stats).sort(([, a], [, b]) => a.timestamp - b.timestamp);

  tasks.forEach((task) => {
    // find which weekly bucket the task belongs to
    for (let i = 0; i < buckets.length; i++) {
      const [key, bucket] = buckets[i];
      const nextBucketEntry = buckets[i + 1];
      const start = bucket.timestamp;
      const end = nextBucketEntry ? nextBucketEntry[1].timestamp : Date.now() + 1;

      if (task.createdAt >= start && task.createdAt < end) {
        stats[key].created++;
      }
      if (task.completedAt && task.completedAt >= start && task.completedAt < end) {
        stats[key].completed++;
      }
    }
  });
}

export const getUserActivityStats = query({
  args: {
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (memberships.length === 0) return [];

    const projectIds = memberships.map((m) => m.projectId);
    const stats = buildStatBuckets(args.period);

    const allTasks = await Promise.all(
      projectIds.map((projectId) =>
        ctx.db
          .query("tasks")
          .withIndex("by_project", (q) => q.eq("projectId", projectId))
          .collect()
      )
    );

    const tasks = allTasks.flat();

    if (args.period === "monthly") {
      bucketMonthlyTasks(stats, tasks);
    } else {
      tasks.forEach((task) => {
        const createdKey = getTaskKey(task.createdAt, args.period);
        if (stats[createdKey]) stats[createdKey].created++;

        if (task.completedAt) {
          const completedKey = getTaskKey(task.completedAt, args.period);
          if (stats[completedKey]) stats[completedKey].completed++;
        }
      });
    }

    return Object.entries(stats)
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .map(([_, val]) => ({
        name: val.label,
        created: val.created,
        completed: val.completed,
      }));
  },
});

export const getActivityStats = query({
  args: {
    projectId: v.id("projects"),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const member = await getProjectMember(ctx, user._id, args.projectId);

    if (!member) return [];

    const stats = buildStatBuckets(args.period);

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (args.period === "monthly") {
      bucketMonthlyTasks(stats, tasks);
    } else {
      tasks.forEach((task) => {
        const createdKey = getTaskKey(task.createdAt, args.period);
        if (stats[createdKey]) stats[createdKey].created++;

        if (task.completedAt) {
          const completedKey = getTaskKey(task.completedAt, args.period);
          if (stats[completedKey]) stats[completedKey].completed++;
        }
      });
    }

    return Object.entries(stats)
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .map(([_, val]) => ({
        name: val.label,
        created: val.created,
        completed: val.completed,
      }));
  },
});
