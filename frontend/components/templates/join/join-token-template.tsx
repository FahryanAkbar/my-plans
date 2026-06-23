"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

import { Loaders } from "@/components/atoms";
import { JoinPageContent, JoinAuthCard } from "@/components/organisms";

export interface JoinTokenTemplateProps {
  token: string;
}

export const JoinTokenTemplate = ({ token }: JoinTokenTemplateProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F4F6] p-4 dark:bg-[#0F0F0F] selection:bg-primary/30">
      <Authenticated>
        <JoinPageContent token={token} />
      </Authenticated>
      
      <Unauthenticated>
        <JoinAuthCard token={token} />
      </Unauthenticated>

      <AuthLoading>
        <div className="w-full max-w-100 flex items-center justify-center">
          <Loaders size="lg" className="text-[#112D55]" />
        </div>
      </AuthLoading>
    </div>
  );
};
