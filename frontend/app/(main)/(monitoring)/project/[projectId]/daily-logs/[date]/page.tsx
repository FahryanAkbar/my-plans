"use client";

import { use } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { DailyLogsTemplate } from "@/components/templates";

interface DailyLogPageProps {
  params: Promise<{
    projectId: Id<"projects">;
    date: string;
  }>;
}

const DailyLogPage = ({ params }: DailyLogPageProps) => {
  const { projectId, date } = use(params);

  return (
    <DailyLogsTemplate 
      projectId={projectId}
      dateStr={date}
    />
  );
};

export default DailyLogPage;
