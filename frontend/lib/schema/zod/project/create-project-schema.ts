import z from "zod";
import { PROJECT_PLATFORM } from "@/lib/constants";

export const createProjectSchema = z
  .object({
    name: z.string().min(1),

    description: z.string().optional(),

    startDate: z.date(),

    endDate: z.date().optional(),

    platform: z
      .enum([
        PROJECT_PLATFORM.WEB,
        PROJECT_PLATFORM.MOBILE,
        PROJECT_PLATFORM.DESKTOP,
        PROJECT_PLATFORM.OTHER,
      ])
      .optional(),

    isCollaborative: z.boolean(),
  })
  .refine(
    (data) =>
      !data.endDate || data.endDate >= data.startDate,
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  )
  .transform((data) => ({
    name: data.name,
    description: data.description,
    startDate: data.startDate.getTime(),
    endDate: data.endDate?.getTime(),
    platform: data.platform,
    isCollaborative: data.isCollaborative,
  }));