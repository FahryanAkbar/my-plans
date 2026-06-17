"use client";

import { cn } from "@/lib/utils";

interface SafeFilePreviewProps {
  url: string;
  title?: string;
  className?: string;
  height?: string | number;
}

export const SafeFilePreview = ({ 
  url, 
  title, 
  className,
  height = "500px" 
}: SafeFilePreviewProps) => {
  if (!url) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-lg border bg-muted/50", className)}>
      <iframe
        src={`${url}#toolbar=0&navpanes=0`}
        title={title || "Secure File Preview"}
        sandbox="allow-forms allow-popups allow-same-origin"
        style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height }}
        className="border-none"
      />
      <div className="absolute bottom-2 right-2 flex gap-2">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="rounded bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm hover:bg-background"
        >
          Open Original
        </a>
      </div>
    </div>
  );
};
