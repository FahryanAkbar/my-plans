"use client"

import { use } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { ProjectIdTemplate } from "@/components/templates";

interface ProjectIdPageProps {
  params: Promise<{
    projectId: Id<"projects">;
  }>;
}

const ProjectIdPage = ({ params }: ProjectIdPageProps) => {
  const { projectId } = use(params);

  return <ProjectIdTemplate projectId={projectId} />;
};

export default ProjectIdPage;