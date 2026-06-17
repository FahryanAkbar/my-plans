"use client";

import * as React from "react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  ROLES, 
  Role, 
  INVITATION_DEFAULT_POSITION, 
  InvitationPosition 
} from "@/lib/constants";
import { stripHtml } from "@/lib/utils";
import {
  type InviteMemberPayload,
  type InviteMembersResult,
} from "@/types/features";

export type InviteRow = {
  id: string;
  email: string;
  position: InvitationPosition;
  role: Role;
};

export const isValidEmail = (value: string) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim());
};

const DEFAULT_ROW: InviteRow = {
  id: Math.random().toString(36).substring(2, 9),
  email: "",
  position: INVITATION_DEFAULT_POSITION.MEMBER,
  role: ROLES.FE,
};

interface UseInviteMembersProps {
  open: boolean;
  projectId?: string;
  onOpenChange: (open: boolean) => void;
  onInvite?: (members: InviteMemberPayload[]) => Promise<InviteMembersResult> | void;
  inviteLink?: string;
  projectName?: string;
  sendEmail?: boolean;
  sendEmailEndpoint?: string;
  emailSubject?: string;
  emailBrandName?: string;
}

export const useInviteMembers = ({
  open,
  projectId,
  onOpenChange,
  onInvite,
  inviteLink = "",
  projectName = "Project",
  sendEmail = true,
  sendEmailEndpoint = "/api/send",
  emailSubject,
  emailBrandName = "Notion Clone Trial",
}: UseInviteMembersProps) => {
  const [rows, setRows] = React.useState<InviteRow[]>([DEFAULT_ROW]);
  const [allowAutoSignup, setAllowAutoSignup] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateProject = useMutation(api.project.update);

  const handleUpdateMaxUses = async (maxUses: number | null | undefined, silent = false) => {
    if (!projectId) return;
    try {
      await updateProject({
        id: projectId as Id<"projects">,
        inviteMaxUses: maxUses === undefined ? null : maxUses,
      });
      if (!silent) {
        toast.success(maxUses === undefined || maxUses === null ? "Limit removed" : "Limit updated");
      }
    } catch {
      if (!silent) toast.error("Failed to update limit");
    }
  };

  const handleUpdateDefaultJoinRole = async (role: string) => {
    if (!projectId) return;
    try {
      await updateProject({
        id: projectId as Id<"projects">,
        defaultJoinRole: role,
      });
      toast.success("Default join role updated");
    } catch {
      toast.error("Failed to update default join role");
    }
  };

  const handleUpdateDefaultJoinPosition = async (position: string) => {
    if (!projectId) return;
    try {
      await updateProject({
        id: projectId as Id<"projects">,
        defaultJoinPosition: position,
      });
      toast.success("Default join position updated");
    } catch {
      toast.error("Failed to update default join position");
    }
  };

  const handleRegenerateInviteLink = async () => {
    if (!projectId) return;
    try {
      const newToken = `join_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      await updateProject({
        id: projectId as Id<"projects">,
        inviteToken: newToken,
        inviteUseCount: 0,
      });
      toast.success("Invite link regenerated");
    } catch {
      toast.error("Failed to regenerate invite link");
    }
  };

  const validEmails = React.useMemo(() => 
    rows.map(r => r.email.trim()).filter(isValidEmail),
    [rows]
  );

  const existenceData = useQuery(
    api.invitation.checkEmailsExistence,
    open && projectId && validEmails.length > 0 
      ? { projectId: projectId as Id<"projects">, emails: validEmails } 
      : "skip"
  );

  React.useEffect(() => {
    if (!open) return;
    setRows([
      {
        id: Math.random().toString(36).substring(2, 9),
        email: "",
        position: INVITATION_DEFAULT_POSITION.MEMBER,
        role: ROLES.FE,
      },
    ]);
    setAllowAutoSignup(true);
    setIsSubmitting(false);
  }, [open]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        email: "",
        position: INVITATION_DEFAULT_POSITION.MEMBER,
        role: ROLES.FE,
      },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((row) => row.id !== id);
    });
  };

  const updateRow = (id: string, patch: Partial<InviteRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const sendInvitationEmails = async (invites: (InviteMemberPayload & { token?: string })[]) => {
    if (!sendEmail || invites.length === 0) return { sent: 0, failed: 0 };

    const subject = emailSubject ?? `You're invited to join ${projectName}`;
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const results = await Promise.allSettled(
      invites.map((invite) => {
        const joinUrl = invite.token 
          ? `${origin}/join/${invite.token}`
          : inviteLink || origin;

        return fetch(sendEmailEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: invite.email,
            subject,
            template: {
              recipientName: invite.email.split("@")[0],
              brandName: emailBrandName,
              subjectTitle: subject,
              previewText: `Join ${projectName} as ${invite.role}`,
              intro: `Hi ${invite.email.split("@")[0]},`,
              message: `You have been invited as ${invite.role} to collaborate on ${projectName}.`,
              ctaLabel: "Open invitation",
              ctaUrl: joinUrl,
            },
          }),
        });
      })
    );

    const failed = results.filter((result) => {
      if (result.status === "rejected") return true;
      return !result.value.ok;
    }).length;
    const sent = invites.length - failed;
    return { sent, failed };
  };

  const handleInvite = async () => {
    const normalized = rows
      .map((row) => ({ ...row, email: stripHtml(row.email.trim()) }))
      .filter((row) => row.email.length > 0);

    if (normalized.length === 0) {
      toast.error("Please add at least one email");
      return;
    }

    const invalid = normalized.find((row) => !isValidEmail(row.email));
    if (invalid) {
      toast.error(`Invalid email: ${invalid.email}`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const membersAlreadyIn = normalized.filter(row => 
        existenceData?.find(d => d.email === row.email && d.isMember)
      );

      if (membersAlreadyIn.length > 0) {
        toast.error(`User sudah terdaftar dalam project ini: ${membersAlreadyIn[0].email}`, {
          description: "Mohon hapus email yang sudah terdaftar sebelum mengirim undangan."
        });
        setIsSubmitting(false);
        return;
      }

      const invites = normalized.map((row) => ({
        email: row.email,
        position: row.position,
        role: row.role,
      }));

      const result = await onInvite?.(invites);
      
      const skippedCount = result?.skipped?.length || 0;
      const createdCount = result?.created || 0;
      const updatedCount = result?.updated || 0;

      const invitesWithTokens = invites.map(invite => {
        const match = result?.invitations?.find((inv) => inv.email === invite.email);
        return {
          ...invite,
          token: match?.token
        };
      }).filter(inv => inv.token);

      const emailResult = await sendInvitationEmails(invitesWithTokens);

      const statusLabel = allowAutoSignup ? "with auto signup enabled" : "";
      
      if (skippedCount > 0 && createdCount === 0 && updatedCount === 0) {
        toast.info(`${skippedCount} user(s) are already members of this project.`, {
          description: "No new invitations were sent."
        });
      } else if (emailResult.failed > 0) {
        toast.error(
          `Invitations created, but ${emailResult.failed} email(s) failed to send`
        );
      } else {
        const message = skippedCount > 0 
          ? `Sent ${createdCount + updatedCount} invitations. ${skippedCount} were already members.`
          : `Invitations sent ${statusLabel}`.trim();
        toast.success(message);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Invite error:", error);
      toast.error("Failed to send invitations");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    rows,
    allowAutoSignup,
    isSubmitting,
    existenceData,
    setAllowAutoSignup,
    addRow,
    removeRow,
    updateRow,
    handleInvite,
    handleUpdateMaxUses,
    handleUpdateDefaultJoinRole,
    handleUpdateDefaultJoinPosition,
    handleRegenerateInviteLink,
  };
};
