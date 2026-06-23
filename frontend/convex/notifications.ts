import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

import { NOTIFICATION_TYPE } from "@/lib/constants/project";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    const notificationsWithSender = await Promise.all(
      notifications.map(async (notification) => {
        if (notification.senderId) {
          const sender = await ctx.db.get(notification.senderId);
          return {
            ...notification,
            senderName: sender?.fullName,
            senderImageUrl: sender?.imageUrl,
          };
        }
        return notification;
      })
    );

    return notificationsWithSender;
  },
});


export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return 0;

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read_status", (q) => 
        q.eq("userId", user._id).eq("isRead", false)
      )
      .collect();

    return unreadNotifications.length;
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.id);
    if (!notification) throw new Error("Notification not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || notification.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read_status", (q) => 
        q.eq("userId", user._id).eq("isRead", false)
      )
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { isRead: true });
    }
  },
});

export const create = internalMutation({
  args: {
    userId: v.id("users"),
    senderId: v.optional(v.id("users")),
    type: v.union(
      v.literal(NOTIFICATION_TYPE.TASK_ASSIGNED),
      v.literal(NOTIFICATION_TYPE.COMMENT_TAGGED),
      v.literal(NOTIFICATION_TYPE.PROJECT_INVITATION),
      v.literal(NOTIFICATION_TYPE.MEMBER_REMOVED),
      v.literal(NOTIFICATION_TYPE.STATUS_CHANGED)
    ),
    title: v.string(),
    description: v.optional(v.string()),
    link: v.optional(v.string()),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.id);
    if (!notification) throw new Error("Notification not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || notification.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
