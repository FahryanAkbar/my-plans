import { Id } from "@/convex/_generated/dataModel";
import { IssuesTemplate } from "@/components/templates";

interface IssuesPageProps {
  params: Promise<{
    projectId: Id<"projects">;
  }>
}

const TasksPage = async ({ params }: IssuesPageProps) => {
  const { projectId } = await params;

  return (<IssuesTemplate projectId={projectId} />)
}

export default TasksPage;