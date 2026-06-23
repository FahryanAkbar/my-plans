import { Id } from "@/convex/_generated/dataModel";

export interface IssueActivity {
  _id: Id<"issueActivities">;
  _creationTime: number;
  issueId: Id<"issues">;
  userId: Id<"users">;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  issueTitle?: string;
  createdAt: number;
  user?: {
    fullName: string;
    imageUrl?: string;
  };
}