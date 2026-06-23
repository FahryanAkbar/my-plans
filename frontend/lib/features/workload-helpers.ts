import { MemberWorkload } from "@/hooks";
import { WORKLOAD_CONFIGURATION } from "@/lib";

export const getMemberWorkloadConfig = (
  status: MemberWorkload['status']
) => {
  const key = status.toUpperCase() as keyof typeof WORKLOAD_CONFIGURATION;
  return WORKLOAD_CONFIGURATION[key] || WORKLOAD_CONFIGURATION.AVAILABLE;
}