import { IssueStatus } from "@/lib";
import { IssueWithDetails, CreateIssueValues } from "@/hooks";
import { Id } from "@/convex/_generated/dataModel";

export interface IssueColumnProps {
  id: IssueStatus;
  title: string;
  color: string;
  issues: IssueWithDetails[];
  onAddClick?: (status: IssueStatus) => void;
  onIssueClick?: (id: string) => void;
  onEdit?: (issue: IssueWithDetails) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: Id<"issues">, checked: boolean) => void;
  onSelectAll?: (status: IssueStatus, checked: boolean) => void;
  selectedIds?: Set<Id<"issues">>;
  isAllSelected?: boolean;
  selectedCount?: number;
  onBulkDelete?: (status: IssueStatus) => void;
  onBulkStatusUpdate?: (status: IssueStatus) => void;
  onBulkArchive?: (isArchived: boolean) => void;
  onUpdate?: (id: Id<"issues">, updates: Partial<CreateIssueValues>) => void;
}