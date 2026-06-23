'use client';

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export const UserSync = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const fingerprint = `${user.fullName}-${user.imageUrl}-${user.primaryEmailAddress?.emailAddress}`;

    if (lastSynced.current === fingerprint) return;

    lastSynced.current = fingerprint;

    syncUser({
      fullName: user.fullName || "Anonymous",
      email: user.primaryEmailAddress?.emailAddress || "",
      imageUrl: user.imageUrl,
    });
  }, [user, isLoaded, isSignedIn, syncUser]);

  return null;
};