"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

interface UseProjectCoverProps {
  projectImage?: string;
  onUpdate?: (updates: { projectImage?: string }) => void;
}

export const useProjectCover = ({
  projectImage,
  onUpdate
}: UseProjectCoverProps) => {
  const defaultPosY = 50;

  const parsePosY = (imgUrl?: string) => {
    if (!imgUrl) return defaultPosY;
    const match = imgUrl.match(/#pos=([0-9.]+)/);
    return match ? parseFloat(match[1]) : defaultPosY;
  };

  const [isRepositioning, setIsRepositioning] = useState(false);
  const [positionY, setPositionY] = useState(parsePosY(projectImage));

  const startY = useRef(0);
  const startPos = useRef(positionY);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isRepositioning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPositionY(parsePosY(projectImage));
    }
  }, [projectImage, isRepositioning]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isRepositioning) return;
    e.preventDefault();
    isDragging.current = true;
    startY.current = e.clientY;
    startPos.current = positionY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !isRepositioning) return;
    e.preventDefault();
    
    const deltaY = e.clientY - startY.current;
    const containerHeight = e.currentTarget.clientHeight;
    
    const percentageDelta = (deltaY / containerHeight) * 100;
    let newPos = startPos.current - percentageDelta;
    
    if (newPos < 0) newPos = 0;
    if (newPos > 100) newPos = 100;
    
    setPositionY(newPos);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const onSavePosition = async () => {
    if (!projectImage || !onUpdate) return;
    try {
      const cleanUrl = projectImage.split('#')[0];
      const newUrl = `${cleanUrl}#pos=${positionY.toFixed(2)}`;

      await onUpdate({
        projectImage: newUrl
      });
      setIsRepositioning(false);
      toast.success("Cover position updated");
    } catch {
      toast.error("Failed to save cover position");
    }
  };

  const onCancelPosition = () => {
    setPositionY(parsePosY(projectImage));
    setIsRepositioning(false);
  };

  const cleanUrl = projectImage ? projectImage.split('#')[0] : "";

  return {
    isRepositioning,
    setIsRepositioning,
    positionY,
    cleanUrl,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    onSavePosition,
    onCancelPosition
  };
};
