import { Metadata } from "next";

import { ProjectTemplate } from "@/components/templates";

export const metadata: Metadata = {
  title: "My PLAN | Project",
  description: 
    "Access your documents in Notion Clone!"
}

const ProjectPage = () => {
  return <ProjectTemplate />
}

export default ProjectPage