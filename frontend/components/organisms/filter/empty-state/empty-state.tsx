"use client";

import Image from "next/image";
import { PlusCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { Button, Typography } from "@/components/atoms";

interface EmptyStateProps {
  onCreate?: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  imageSrc?: string;
}

export const EmptyState = ({ 
  onCreate,
  title,
  description,
  actionLabel = "Create your first document",
  imageSrc = "/empty-state.svg",
}: EmptyStateProps) => {
  const { user } = useUser();

  const displayTitle = title || `Welcome to ${user?.firstName || "your"}&apos;s Workspace`;
  const displayDescription = description || "Create your very first page to start jotting down ideas, managing tasks, and organizing documents.";

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-5 p-8 text-center animate-in fade-in zoom-in duration-300">
      <div className="relative h-60 w-60 mb-2">
        <Image
          src={imageSrc}
          fill
          alt={displayTitle}
          className="dark:hidden object-contain opacity-75 transition-opacity duration-300 hover:opacity-90"
        />
        <Image
          src={imageSrc}
          fill
          alt={displayTitle}
          className="hidden dark:block object-contain opacity-40 transition-opacity duration-300 hover:opacity-55 mix-blend-screen"
        />
      </div>
      
      <div className="space-y-1.5 max-w-md">
        <Typography variant="label" className="font-bold tracking-tight text-foreground">
          {title || (
            <>Welcome to {user?.firstName || "your"}&apos;s Workspace</>
          )}
        </Typography>
        <Typography variant="muted" className="text-sm leading-relaxed">
          {displayDescription}
        </Typography>
      </div>

      {onCreate && (
        <Button 
          onClick={onCreate} 
          className="mt-2 shadow-md transition-all hover:shadow-lg hover:-translate-y-px active:scale-95 gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
