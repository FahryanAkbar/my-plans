export interface ProjectMember {
  userId: string;
  fullName: string;
  imageUrl?: string;
  role?: string;
  position?: string;
  joinedAt: number;
}