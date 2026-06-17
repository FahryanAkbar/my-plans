"use client";

import Image from "next/image";
import { LucideIcon } from "lucide-react";
import { Button, Typography } from "@/components/atoms";
import { cn } from "@/lib/utils";

interface EmptyItemProps {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
}

export const EmptyItem = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
  className,
}: EmptyItemProps) => {
  return (
    <div className={cn(
      "h-full flex flex-col items-center justify-center space-y-4 p-8 text-center animate-in fade-in zoom-in duration-300",
      className
    )}>
      <div className="relative h-48 w-48 mb-2">
        <Image
          src="/no-data.svg"
          fill
          alt="No Data State"
          className="dark:hidden object-contain opacity-75 transition-opacity duration-300 hover:opacity-90"
        />
        <Image
          src="/no-data.svg"
          fill
          alt="No Data State"
          className="hidden dark:block object-contain opacity-40 transition-opacity duration-300 hover:opacity-55 mix-blend-screen"
        />
      </div>
      
      {title && (
        <Typography variant='label' className="font-bold tracking-tight">
          {title}
        </Typography>
      )}
      
      <Typography variant="muted" className="max-w-105 leading-relaxed">
        {description}
      </Typography>
      
      {onAction && actionLabel && (
        <Button onClick={onAction} className="mt-4 shadow-md transition-all hover:shadow-lg active:scale-95">
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
