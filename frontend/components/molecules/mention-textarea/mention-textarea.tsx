"use client";

import React, { useState, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { 
  Command, 
  CommandGroup, 
  CommandItem, 
  CommandList 
} from "@/components/atoms";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export interface MentionUser {
  id: Id<"users">;
  fullName: string;
  imageUrl?: string;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string, mentionedIds: Id<"users">[]) => void;
  placeholder?: string;
  users: MentionUser[];
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

export const MentionTextarea = ({
  value,
  onChange,
  placeholder,
  users,
  className,
  onKeyDown,
  disabled
}: MentionTextareaProps) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [mentionMap, setMentionMap] = useState<Record<string, Id<"users">>>({});

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart ?? 0;
    setCursorPos(position);

    const textBeforeCursor = newValue.substring(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " ";
    const isValidTrigger = lastAtIndex !== -1 && (charBeforeAt === " " || charBeforeAt === "\n");

    if (isValidTrigger) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ")) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }

    const mentionedIds = extractIdsFromText(newValue, mentionMap);
    onChange(newValue, mentionedIds);
  };

  const selectUser = (user: MentionUser) => {
    const textBeforeAt = value.substring(0, value.lastIndexOf("@", cursorPos - 1));
    const textAfterAt = value.substring(cursorPos);
  
    const cleanName = `@${user.fullName}`;
    const newValue = `${textBeforeAt}${cleanName} ${textAfterAt}`;

    setMentionMap(prev => ({ ...prev, [cleanName]: user.id }));
    
    setShowMentions(false);
    const mentionedIds = extractIdsFromText(newValue, { ...mentionMap, [cleanName]: user.id });
    onChange(newValue, mentionedIds);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = textBeforeAt.length + cleanName.length + 1; 
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  return (
    <div className="relative w-full">
      <TextareaAutosize
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full bg-transparent border-none focus:ring-0 outline-none resize-none p-4 text-sm font-medium placeholder:text-muted-foreground/50 min-h-25",
          "text-foreground/90 selection:bg-primary/20",
          className
        )}
      />
      
      {showMentions && users.length > 0 && (
        <div className="absolute z-60 top-full left-4 -mt-2 w-64 bg-card border border-border shadow-2xl rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
           <Command className="bg-transparent" shouldFilter={true}>
             <CommandList className="max-h-50 overflow-y-auto scrollbar-hide">
               <CommandGroup heading="Project Members" className="p-1">
                 {users
                  .filter(u => u.fullName.toLowerCase().includes(mentionSearch.toLowerCase()))
                  .map((user) => (
                   <CommandItem
                     key={user.id}
                     onSelect={() => selectUser(user)}
                     className="flex items-center gap-2 p-2 cursor-pointer hover:bg-primary/5 rounded-lg transition-colors aria-selected:bg-primary/10"
                   >
                     <Avatar className="h-6 w-6 border border-border/50">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary">
                          {user.fullName[0]}
                        </AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight">{user.fullName}</span>
                     </div>
                   </CommandItem>
                 ))}
               </CommandGroup>
             </CommandList>
           </Command>
        </div>
      )}
    </div>
  );
};

function extractIdsFromText(text: string, map: Record<string, Id<"users">>): Id<"users">[] {
  const ids: Id<"users">[] = [];
  Object.entries(map).forEach(([name, id]) => {
    if (text.includes(name)) {
      ids.push(id);
    }
  });
  return Array.from(new Set(ids));
}
