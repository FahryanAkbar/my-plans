import { IssueColumnProps } from "@/types/features";

export const useIssueColumn = (props: IssueColumnProps) => {
  const { issues, selectedIds } = props;

  const isAllSelected = issues.length > 0 && issues.every(i => selectedIds?.has(i._id));
  const selectedCount = issues.filter(i => selectedIds?.has(i._id)).length;

  return {
    ...props,
    isAllSelected,
    selectedCount,
  };
};
