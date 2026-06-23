export interface TeamMemberKPI {
  userId: string;
  fullName: string;
  imageUrl?: string;
  role: string;
  totalScore: number;
  completionProgress: number;
  metrics: {
    tasksCompleted: number;
    earlyCompletions: number;
    efficiencyBonuses: number;
    lateCompletions: number;
  };
}
