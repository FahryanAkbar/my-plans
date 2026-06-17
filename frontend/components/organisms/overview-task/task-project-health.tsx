"use client";

import { Id } from "@/convex/_generated/dataModel";
import { useProjectHealth } from "@/hooks";

import { 
  HEALTH_GAUGE_SEGMENTS,
  getHealthStatusLabel, 
  formatHealthDetailedStats
} from "@/lib";

import { MetricMeter } from "@/components/molecules";
import { OverviewTaskSkeleton } from "@/components/organisms";

interface TaskProjectHealthProps {
  projectId: Id<"projects">;
  className?: string;
}

export const TaskProjectHealth = ({
  projectId,
  className
}: TaskProjectHealthProps) => {
  const healthData = useProjectHealth(projectId);
  const { strength, isLoading } = healthData;

  const projectStats = formatHealthDetailedStats(healthData)
  const statusLabel = getHealthStatusLabel(strength);

  if (isLoading) {
    return (
      <OverviewTaskSkeleton 
        variant="card" 
        titleWidth="w-48" 
        className={className} 
      />
    );
  }

  return (
    <div className={className}>
      <MetricMeter 
        title="Project Strength"
        value={strength}
        label={`${strength}%`}
        subLabel={statusLabel}
        info="Project Strength is a composite score of task completion vs. timeline adherence. Overdue tasks negatively impact this score."
        segments={HEALTH_GAUGE_SEGMENTS}
        stats={projectStats}
        className="h-full border-none shadow-none bg-card/40"
      />
    </div>
  );
};
