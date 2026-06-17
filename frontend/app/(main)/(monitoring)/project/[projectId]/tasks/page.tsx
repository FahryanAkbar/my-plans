import { Id } from "@/convex/_generated/dataModel";
import { TaskTemplate } from "@/components/templates";

interface TasksPageProps {
  params: Promise<{
    projectId: Id<"projects">;
  }>
}

const TasksPage = async ({ params }: TasksPageProps) => {
  const { projectId } = await params;

  return (<TaskTemplate projectId={projectId} />)
}

export default TasksPage;