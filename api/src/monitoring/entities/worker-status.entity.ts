export interface WorkerStatus {
  hostname: string;
  pid: number;
  uptime: number;
  memory: number;
  activeJobs: number;
  timestamp: string;
}
