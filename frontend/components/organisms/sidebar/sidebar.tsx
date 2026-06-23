"use client";

import { Plus, Trash, Columns2 } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent, Typography } from "@/components/atoms";
import { Item } from "@/components/organisms";
import { DocumentList, TrashBox, SidebarNavigation, ProjectList } from "@/components/organisms";
import { cn } from "@/lib";

interface SidebarProps {
  isMobile: boolean;
  isCollapsed: boolean;
  isResetting: boolean;
  onCollapse: () => void;
  onResetWidth: () => void;
  onCreate: () => void;
  sidebarRef: React.RefObject<HTMLElement | null>;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const Sidebar = ({
  isMobile,
  isCollapsed,
  isResetting,
  onCollapse,
  onResetWidth,
  onCreate,
  sidebarRef,
  onMouseDown,
}: SidebarProps) => {
  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "group/sidebar h-full bg-sidebar overflow-y-auto relative flex w-60 flex-col z-40",
        isResetting && "transition-all ease-in-out duration-300",
        isMobile && "w-0",
        isCollapsed && "w-0 overflow-hidden opacity-0 pointer-events-none"
      )}
    >
      <div
        onClick={onCollapse}
        role="button"
        className="h-6 w-6 text-sidebar-muted-foreground rounded-s absolute top-3 right-2 transition cursor-pointer opacity-100"
      >
        <Columns2 className="h-6 w-6" />
      </div>

      <SidebarNavigation handleCreate={onCreate} />

      <div className="mt-4">
        <Typography 
          variant="muted" 
          className="text-[11px] font-bold text-sidebar-muted-foreground uppercase tracking-widest mb-3 px-3"
        >
          My Documents
        </Typography>
        <DocumentList />
        <Item onClick={onCreate} icon={Plus} label="Add a page" />
      </div>

      <ProjectList />

      <div className="mt-4">
        <Popover>
          <PopoverTrigger className="w-full mt-4">
            <Item label="Trash" icon={Trash} />
          </PopoverTrigger>
          <PopoverContent
            className="p-0 w-72"
            side={isMobile ? "bottom" : "right"}
          >
            <TrashBox />
          </PopoverContent>
        </Popover>
      </div>

      {!isMobile && (
        <div
          onMouseDown={onMouseDown}
          onClick={onResetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 right-0 top-0"
        />
      )}
    </aside>
  );
};
