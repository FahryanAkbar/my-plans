"use client";

import { useRouter } from "next/navigation";
import { Loaders } from "@/components/atoms";
import { CardInfo } from "@/components/molecules";
import { JoinProjectCard } from "./join-project-card";
import { JoinErrorCard } from "./join-error-card";
import { useInvitation } from "@/hooks";
import { cn } from "@/lib";

interface JoinPageContentProps {
  token: string;
}

export const JoinPageContent = ({ token }: JoinPageContentProps) => {
  const router = useRouter();
  const { 
    preview, 
    error, 
    isJoining, 
    hasJoined, 
    handleJoin, 
    isLimitError 
  } = useInvitation(token);

  const cardBaseStyles = "border-none bg-white dark:bg-[#1A1A1A] shadow-2xl rounded-[2.5rem] overflow-hidden";
  const isSplitState = preview !== undefined && !("error" in preview) && !hasJoined;

  return (
    <div className={cn(
      "w-full px-6 flex justify-center",
      isSplitState ? "max-w-4xl" : "max-w-2xl"
    )}>
      {hasJoined && (
        <div className="w-full">
          <CardInfo
            layout="centered"
            icon={<Loaders size="lg" />}
            title="Joined Successfully"
            description="We're redirecting you to your new workspace..."
            className={cardBaseStyles}
            headerClassName="pt-16 pb-16 px-10"
          />
        </div>
      )}

      {error && !hasJoined && (
        <JoinErrorCard 
          error={error} 
          isLimitError={isLimitError} 
        />
      )}

      {preview === undefined && !error && !hasJoined && (
        <div className="w-full">
          <CardInfo
            layout="centered"
            title="Verifying Access"
            description="Just a moment, we're validating your invitation link."
            className={cardBaseStyles}
            headerClassName="pt-16 pb-16 px-10"
          />
        </div>
      )}

      {isSplitState && (
        <JoinProjectCard
          inviterName={preview.inviterName}
          projectName={preview.projectName}
          onAccept={handleJoin}
          onReject={() => router.push("/project")}
          onCancel={() => router.push("/project")}
          isJoining={isJoining}
        />
      )}
    </div>
  );
};
