"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib";
import { FileIcon, ExternalLink, Download, Loader2 } from "lucide-react";
import { Typography } from "@/components/atoms";
import Image from "next/image";

interface IssueAttachmentItemProps {
  storageId: string;
}

export const IssueAttachmentItem = ({ storageId }: IssueAttachmentItemProps) => {
  const url = useQuery(api.files.getFileUrl, { storageId });
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!url) return (
    <div className="h-32 w-40 rounded-2xl bg-muted/10 animate-pulse border border-border/30 flex items-center justify-center">
      <Loader2 className="h-5 w-5 text-muted-foreground/20 animate-spin" />
    </div>
  );

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative flex flex-col items-center justify-center h-32 w-40 rounded-2xl bg-card border border-border/30 hover:border-primary/40 hover:bg-muted/10 transition-all overflow-hidden shadow-sm hover:shadow-xl active:scale-95"
    >
      {!isError ? (
        <div className="relative w-full h-full bg-muted/5">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="h-5 w-5 text-muted-foreground/20 animate-spin" />
            </div>
          )}
          <Image 
            src={url} 
            alt="Attachment Preview" 
            fill
            sizes="160px"
            onLoadingComplete={() => setIsLoaded(true)}
            onError={() => setIsError(true)}
            className={cn(
              "object-cover transition-all duration-700",
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
            )} 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] z-20">
            <ExternalLink className="h-6 w-6 text-white animate-in zoom-in-50 duration-300" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">View Full</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300 shadow-inner">
            <FileIcon className="h-6 w-6 text-primary/60" />
          </div>
          <Typography className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 truncate w-full">
            File_{storageId.substring(0, 5)}
          </Typography>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-muted rounded-lg shadow-sm">
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      )}
    </a>
  );
};

