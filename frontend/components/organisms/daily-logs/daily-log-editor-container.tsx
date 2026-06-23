"use client";

import React from "react";
import { Editor } from "@/components/molecules";
import { DailyLogEditorSkeleton } from "@/components/organisms";

import { cn } from "@/lib/utils";

interface DailyLogEditorContainerProps {
  isLoading: boolean;
  logId?: string;
  initialContent?: string;
  onChange: (value: string) => void;
  className?: string;
}

export const DailyLogEditorContainer = ({
  isLoading,
  logId,
  initialContent,
  onChange,
  className
}: DailyLogEditorContainerProps) => {
  return (
    <div className={cn(
      "w-full min-h-125 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300",
      className
    )}>
      {isLoading ? (
        <DailyLogEditorSkeleton />
      ) : (
        <div className="prose prose-stone dark:prose-invert max-w-none prose-h1:text-3xl prose-p:text-lg prose-p:leading-relaxed">
          <Editor 
            key={logId || "new"}


            onChange={onChange}
            initialContent={initialContent}
          />
        </div>
      )}
    </div>
  );
};
