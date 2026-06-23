import { z } from "zod";
import { ISSUE_STATUS, ISSUE_SEVERITY, ISSUE_PRIORITY } from "@/lib/constants/issue/issue";

export const createIssueFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  severity: z.nativeEnum(ISSUE_SEVERITY),
  status: z.nativeEnum(ISSUE_STATUS),
  priority: z.nativeEnum(ISSUE_PRIORITY).optional(),
  assigneeId: z.string().optional(),
  labels: z.array(z.string()).optional().default([]),
  attachments: z.array(z.string()).optional().default([]),
  linkedTaskId: z.string().optional().nullable(),
});

export type CreateIssueFormValues = z.infer<typeof createIssueFormSchema>;
