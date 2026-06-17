"use client";

import Image from "next/image";
import { Button, Loaders, Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";

interface JoinProjectCardProps {
  inviterName: string;
  projectName: string;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
  isJoining?: boolean;
  className?: string;
}

export const JoinProjectCard = ({
  inviterName,
  projectName,
  onAccept,
  onReject,
  onCancel,
  isJoining = false,
  className,
}: JoinProjectCardProps) => {
  const cardBaseStyles = "border-none bg-white dark:bg-[#1A1A1A] shadow-xl rounded-[2rem] overflow-hidden";

  return (
    <div className={cn(className)}>
      <div className={cn(cardBaseStyles, "flex flex-col md:flex-row")}>
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center border-r border-gray-100 dark:border-gray-800/50">
          <div className="mb-12">
            <Typography variant="h2" className="text-3xl font-bold text-black dark:text-white mb-4 tracking-tight">
              Project Invitation
            </Typography>
            <Typography variant="p" className="text-base leading-relaxed text-gray-500 dark:text-gray-400 max-w-md">
              You&apos;ve been invited by <strong>{inviterName}</strong> to join <strong>{projectName}</strong>. 
              Collaborate with your team to get the most out of your project.
            </Typography>
          </div>

          <div className="flex flex-col gap-5 max-w-sm">
            <Button
              onClick={onAccept}
              disabled={isJoining}
              variant="default"
              className="h-10 w-full rounded-xl font-bold text-sm shadow-sm"
            >
              {isJoining ? (
                <span className="flex items-center gap-2">
                  <Loaders size="sm" className="text-current" />
                  Joining...
                </span>
              ) : "Accept Invitation"}
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onReject}
                disabled={isJoining}
                className="h-10 font-semibold text-sm transition-colors"
              >
                Reject
              </Button>
              <Button
                variant="ghost"
                onClick={onCancel}
                disabled={isJoining}
                className="h-10 text-gray-400 hover:text-black dark:hover:text-white font-semibold text-sm transition-colors"
              >
                Cancel
              </Button>
            </div>
          </div>
          
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center p-12 relative overflow-hidden bg-gray-50/50 dark:bg-white/5">
          <div className="relative z-10 text-center">
            <div className="relative w-75 h-75 mx-auto mb-8">
              <Image 
                src="/texting.svg" 
                alt="Collaboration" 
                fill 
                className="object-contain dark:hidden"
                priority
              />
              <Image 
                src="/texting.svg" 
                alt="Collaboration" 
                fill 
                className="hidden object-contain dark:block"
                priority
              />
            </div>
            <Typography className="text-lg font-medium text-muted-foreground/50 italic tracking-tight">
              &quot;Work better together.&quot;
            </Typography>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-gray-500/10 to-transparent" />
        </div>
      </div>
    </div>
  );
};
