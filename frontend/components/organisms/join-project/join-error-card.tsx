"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Typography, Separator } from "@/components/atoms";
import { CardInfo } from "@/components/molecules";

interface JoinErrorCardProps {
  error: string;
  isLimitError: (msg: string) => boolean;
}


export const JoinErrorCard = ({ error, isLimitError }: JoinErrorCardProps) => {
  const router = useRouter();

  const isArchived = error.toLowerCase().includes("archived");
  const isCollabDisabled = error.toLowerCase().includes("collaboration");
  const isLimit = isLimitError(error);

  let title = "Something went wrong";
  let description = error;

  if (isArchived) title = "Project Archived";
  else if (isCollabDisabled) title = "Access Restricted";
  else if (isLimit) {
    title = "Link Inactive";
    description = "This invitation has reached its usage limit.";
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardInfo
        className="border-none rounded-4xl overflow-hidden"
        bodyClassName="p-0"
      >
        <div className="flex flex-row items-stretch">
          <div className="flex flex-col justify-center gap-y-5 px-8 py-5 flex-3">
            <div className="space-y-2">
              <Typography className="text-xl font-bold tracking-tight leading-snug">
                {title}
              </Typography>
              <Typography className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </Typography>
            </div>

            <div className="flex flex-row items-center gap-x-3">
              <Button
                onClick={() => router.push("/project")}
                variant="default"
                size="sm"
                className="h-9 px-5 text-xs font-bold  transition-all active:scale-95"
              >
                Return to Home
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="ghost"
                size="sm"
                className="h-9 px-4 text-xs text-muted-foreground hover:text-foreground"
              >
                Try Again
              </Button>
            </div>
          </div>
          <Separator orientation="vertical" className="self-stretch h-auto" />
          <div className="flex items-center justify-center px-6 py-5 flex-2">
            <div className="relative w-full aspect-square max-w-40">
              <Image
                src="/error.svg"
                alt="Error"
                fill
                className="object-contain dark:hidden"
                priority
              />
              <Image
                src="/error.svg"
                alt="Error Dark"
                fill
                className="object-contain hidden dark:block"
                priority
              />
            </div>
          </div>

        </div>
      </CardInfo>
    </div>
  );
};
