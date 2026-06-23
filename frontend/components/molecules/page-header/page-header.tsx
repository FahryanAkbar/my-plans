import * as React from "react";
import { Typography } from "@/components/atoms";
import { cn } from "@/lib";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({
  title,
  description,
  className,
  children,
}: PageHeaderProps) => {
  return (
    <div className={cn("px-6 py-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Typography variant="h3" className="font-bold tracking-tight">
            {title}
          </Typography>
          {description && (
            <Typography variant="muted" className="text-sm">
              {description}
            </Typography>
          )}
        </div>
        {children && <div className="flex items-center gap-2 self-start sm:self-auto">{children}</div>}
      </div>
    </div>
  );
};
