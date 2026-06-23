import { Id } from "@/convex/_generated/dataModel";

export interface UserData {
  fullName: string;
  imageUrl?: string;
}

export interface ReactionData {
  emoji: string;
  count: number;
  hasReacted: boolean;
  userIds: Id<"users">[];
}

export interface CommentData {
  _id: Id<"taskComments">;
  _creationTime: number;
  content: string;
  createdAt: number;
  userId: Id<"users">;
  taskId: Id<"tasks">;
  parentId?: Id<"taskComments">;
  user: UserData | null;
  reactions: ReactionData[];
}

export interface GroupedComment extends CommentData {
  replies: CommentData[];
}
