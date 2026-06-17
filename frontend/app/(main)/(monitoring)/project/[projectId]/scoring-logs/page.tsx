import { Id } from "@/convex/_generated/dataModel";
import { ScoringLogsTemplate } from "@/components/templates";

interface ScoringLogsPageProps {
  params: Promise<{
    projectId: Id<"projects">;
  }>
}

const ScoringLogsPage = async ({ params }: ScoringLogsPageProps) => {
  const { projectId } = await params;

  return (
    <ScoringLogsTemplate projectId={projectId} />
  )
}

export default ScoringLogsPage;
