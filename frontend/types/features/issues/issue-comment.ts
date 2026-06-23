import { Id } from "@/convex/_generated/dataModel";

export interface IssueComment {
  _id: Id<"issueComments">;
  _creationTime: number;
  content: string;
  createdAt: number;
  issueId: Id<"issues">;
  parentId?: Id<"issueComments">;
  userId: Id<"users">;
  user?: {
    fullName: string;
    imageUrl?: string;
  };
}

export interface IssueCommentWithReplies extends IssueComment {
  replies: IssueComment[];
}

