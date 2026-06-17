"use client";

import { useState, useEffect } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { IssueStatus } from "@/lib";
import { Id } from "@/convex/_generated/dataModel";

interface UseIssueBoardProps {
  onStatusChange: (issueId: Id<"issues">, status: IssueStatus) => Promise<void>;
}

export const useIssueBoard = ({ onStatusChange }: UseIssueBoardProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as IssueStatus;
    
    if (onStatusChange) {
      await onStatusChange(draggableId as Id<"issues">, newStatus);
    }
  };

  return {
    isMounted,
    handleDragEnd,
  };
};
