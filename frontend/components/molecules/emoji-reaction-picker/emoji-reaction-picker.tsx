"use client";

import React from "react";
import { SmilePlus } from "lucide-react";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import { useTheme } from "next-themes";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms";

interface EmojiReactionPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

export const EmojiReactionPicker = ({ 
  onSelect, 
  className 
}: EmojiReactionPickerProps) => {
  const { resolvedTheme } = useTheme();

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelect(emojiData.emoji);
  };

  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={className}
              >
                <SmilePlus className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-[10px] font-bold">Add reaction</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="p-0 border-none shadow-2xl z-100" side="top" align="start">
        <EmojiPicker
          theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
          onEmojiClick={handleEmojiClick}
          lazyLoadEmojis
          searchPlaceholder="Search emoji..."
          width={320}
          height={400}
          previewConfig={{ showPreview: false }}
          skinTonesDisabled
        />
      </PopoverContent>
    </Popover>
  );
};
