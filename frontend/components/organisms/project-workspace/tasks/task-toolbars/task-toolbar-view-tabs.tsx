"use client";

import React from "react";
import { 
  LayoutGrid, 
  List, 
  Clock, 
  Layers,
  Calendar as CalendarIcon,
} from "lucide-react";
import { 
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/atoms";
import { tokens } from "@/lib/styles/tokens";

export type TaskView = "overview" | "board" | "list" | "timeline" | "calendar";

interface TaskToolbarViewTabsProps {
  activeView: TaskView;
  onViewChange: (view: TaskView) => void;
}

export const TaskToolbarViewTabs = ({
  activeView,
  onViewChange,
}: TaskToolbarViewTabsProps) => {
  return (
    <div className="w-full xl:w-auto overflow-x-auto overflow-y-hidden scrollbar-hide">
      <Tabs 
        value={activeView} 
        onValueChange={(v) => onViewChange(v as TaskView)}
        className="w-max xl:w-fit"
      >
        <TabsList variant="line" className="h-9 px-0 border-b-0 justify-start">
          <TabsTrigger value="overview" className="px-3 gap-2">
            <LayoutGrid className={tokens.size.iconMd} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="board" className="px-3 gap-2">
            <Layers className={tokens.size.iconMd} />
            Board
          </TabsTrigger>
          <TabsTrigger value="list" className="px-3 gap-2">
            <List className={tokens.size.iconMd} />
            List
          </TabsTrigger>
          <TabsTrigger value="timeline" className="px-3 gap-2">
            <Clock className={tokens.size.iconMd} />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="calendar" className="px-3 gap-2">
            <CalendarIcon className={tokens.size.iconMd} />
            Calendar
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
