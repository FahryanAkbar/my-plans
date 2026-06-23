import { IssueWithDetails } from "@/hooks";

export interface IssueCardProps {
  issue: IssueWithDetails;
  index: number;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  onClick?: (id: string) => void;
  onEdit?: (issue: IssueWithDetails) => void;
  onDelete?: (id: string) => void;
}