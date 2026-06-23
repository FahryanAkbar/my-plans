import z from "zod";
import { ROLES, INVITATION_DEFAULT_POSITION } from "@/lib/constants";

export const invitationProjectSchema = z.object({
  email: z.string().trim().email(),
  position: z.enum([
    INVITATION_DEFAULT_POSITION.ADMIN, 
    INVITATION_DEFAULT_POSITION.MEMBER,
    INVITATION_DEFAULT_POSITION.VIEWER
  ]),
  role: z.enum([
    ROLES.PIC,
    ROLES.FE,
    ROLES.BE,
    ROLES.UIUX,
    ROLES.QA,
    ROLES.BA,
  ]),
});

export const invitationProjectListSchema = z.array(invitationProjectSchema).min(1);

export type InvitationProjectSchema = z.infer<typeof invitationProjectSchema>;
