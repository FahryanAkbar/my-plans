import { Id } from "@/convex/_generated/dataModel"
import type {
  ProjectHeaderProps,
  ProjectToolbarProps,
} from "@/components/organisms"
import type { ProjectRowProps } from "@/components/organisms"

export const PROJECT_HEADER: ProjectHeaderProps = {
  title: "Projects",
  actionLabel: "+ Add Project",
}

export const PROJECT_TOOLBAR: ProjectToolbarProps<ProjectRowProps> = {
  activeTab: "all",
  searchTerm: "",
}

const mockId = (id: string) => id as Id<"projects">