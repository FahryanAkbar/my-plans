import z from "zod";
import { TASK_TYPE, TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";

export const createTaskBaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),

  type: z.nativeEnum(TASK_TYPE).default(TASK_TYPE.TASK),
  status: z.nativeEnum(TASK_STATUS).default(TASK_STATUS.TODO),
  priority: z.nativeEnum(TASK_PRIORITY).default(TASK_PRIORITY.MEDIUM),
  scoreValue: z.number().min(0).default(1),

  assigneeId: z.string().optional(),
  watchers: z.array(z.string()).optional(),
  dueDate: z.number().optional(),

  startDate: z.number().optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
});

const startDateRefinement = (data: { startDate?: number }) => {
  if (data.startDate) {
    const today = new Date().setHours(0, 0, 0, 0);
    return data.startDate >= today;
  }
  return true;
};

const startDateError = {
  message: "Start date cannot be in the past",
  path: ["startDate"],
};

export const createTaskFormSchema = createTaskBaseSchema.refine(
  startDateRefinement,
  startDateError
);

export const createTaskSchema = createTaskBaseSchema.extend({
  projectId: z.string(),
  reporterId: z.string(),
  createdBy: z.string(),
  isArchived: z.boolean().default(false),
  createdAt: z.number(),
  updatedAt: z.number(),
  
  actualHours: z.number().optional(),
  completedAt: z.number().optional(),
  watchers: z.array(z.string()).default([]),
}).refine(startDateRefinement, startDateError);

export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;
export type CreateTaskRequest = z.infer<typeof createTaskSchema>;
