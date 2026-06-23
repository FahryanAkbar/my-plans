"use client";

import Image from "next/image";
import { LogOut, Smile, Trash, MoveVertical } from "lucide-react";
import { cn } from "@/lib";
import { Button } from "@/components/atoms";
import { IconPicker } from "@/components/molecules";
import { useProjectCover } from "@/hooks";

interface ProjectCoverProps {
  name: string;
  projectImage?: string;
  icon?: string;
  onIconChange?: (icon: string) => void;
  onRemoveIcon?: () => void;
  onLeave?: () => void;
  onUpdate?: (updates: { projectImage?: string }) => void;
  className?: string;
}

export const ProjectCover = ({ 
  name, 
  projectImage, 
  icon,
  onIconChange,
  onRemoveIcon,
  onLeave,
  onUpdate,
  className 
}: ProjectCoverProps) => {
  const overlayActionBtnClass = cn(
    "rounded-full px-4 h-9 shadow-sm transition-all duration-300 group/btn cursor-pointer",
    "bg-black/20 hover:bg-black/35 border-white/35 text-white backdrop-blur-md",
    "dark:bg-black/40 dark:hover:bg-black/60 dark:border-white/20 dark:text-white",
    "font-medium text-xs"
  );

  const {
    isRepositioning,
    setIsRepositioning,
    positionY,
    cleanUrl,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    onSavePosition,
    onCancelPosition
  } = useProjectCover({
    projectImage,
    onUpdate
  });

  
  return (
    <div className={cn("relative w-full h-[22vh] bg-muted overflow-hidden group", className)}>
      {projectImage ? (
        <Image
          src={cleanUrl}
          fill
          alt="Project Cover"
          style={{ objectPosition: `center ${positionY}%` }}
          className={cn("object-cover", isRepositioning ? "pointer-events-none" : "")}
          priority
          unoptimized
        />
      ) : (
        <div className="w-full h-full bg-linear-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-600/10 dark:to-purple-600/10 flex items-center justify-center">
          <div className="text-4xl font-bold text-muted-foreground/20 uppercase tracking-tighter opacity-50">
            {name}
          </div>
        </div>
      )}
      {projectImage && (
        <div className="absolute inset-0 bg-black/10" />
      )}

      {isRepositioning && (
        <div 
          className="absolute inset-0 cursor-move z-10 flex items-center justify-center touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div className="bg-black/60 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest pointer-events-none shadow-xl border border-white/10">
            Drag image to reposition
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {!isRepositioning ? (
          <>
            {onIconChange && (
              <IconPicker onChange={onIconChange} asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={overlayActionBtnClass}
                >
                  <Smile className="h-3.5 w-3.5 mr-2" />
                  {icon ? "Change icon" : "Add icon"}
                </Button>
              </IconPicker>
            )}

            {projectImage && onUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRepositioning(true)}
                className={overlayActionBtnClass}
              >
                <MoveVertical className="h-3.5 w-3.5 mr-2" />
                Reposition
              </Button>
            )}

            {icon && onRemoveIcon && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRemoveIcon}
                className={overlayActionBtnClass}
              >
                <Trash className="h-3.5 w-3.5 mr-2" />
                Remove icon
              </Button>
            )}

            {onLeave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLeave}
                className={cn(
                  "rounded-full px-4 h-9 shadow-sm transition-all duration-300 group/btn cursor-pointer",
                  "bg-black/20 hover:bg-destructive/90 border-destructive/50 text-white",
                  "dark:bg-black/40 dark:hover:bg-destructive/80 dark:border-destructive/40 dark:text-destructive-foreground",
                  "hover:text-white hover:border-destructive backdrop-blur-md",
                  "font-medium text-xs"
                )}
              >
                <LogOut className="h-3.5 w-3.5 mr-2 group-hover/btn:-translate-x-1 transition-transform duration-300" />
                Leave Project
              </Button>
            )}
          </>
        ) : (
          <div className="flex items-center gap-x-2 animate-in fade-in zoom-in-95 duration-300">
            <Button
              onClick={onSavePosition}
              className="rounded-full px-4 h-9 bg-white text-black hover:bg-white/90 font-bold text-[10px] uppercase tracking-wider"
              size="sm"
            >
              Save Position
            </Button>
            <Button
              onClick={onCancelPosition}
              variant="outline"
              className="rounded-full px-4 h-9 bg-black/20 hover:bg-black/35 border-white/35 text-white backdrop-blur-md dark:bg-black/20 dark:border-white/20 dark:text-white dark:hover:bg-white/10 font-bold text-[10px] uppercase tracking-wider"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
