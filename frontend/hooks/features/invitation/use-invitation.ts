"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";

export const isLimitError = (msg: string) => msg.includes("usage limit");

export const useInvitation = (token: string) => {
  const router = useRouter();
  const verifyAndJoin = useMutation(api.invitation.verifyAndAcceptJoinByToken);
  const preview = useQuery(api.invitation.previewInvitationByToken, { token });

  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (preview && "error" in preview && !hasJoined) {
      setError(preview.error as string);
    }
  }, [preview, hasJoined]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const result = await verifyAndJoin({ token });
      setHasJoined(true);
      toast.success(result.status === "ALREADY_MEMBER" ? "Welcome back!" : "Successfully joined project!");
      router.push(`/project/${result.projectId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to join project";
      setError(msg);
      if (!msg.includes("usage limit")) toast.error(msg);
    } finally {
      setIsJoining(false);
    }
  };

  return {
    preview,
    error,
    isJoining,
    hasJoined,
    handleJoin,
    isLimitError: (msg: string) => isLimitError(msg),
  };
};
