"use client";

import React from "react";
import { Search, ChevronLeft, Calendar as CalendarIcon } from "lucide-react";

import { format } from "date-fns";
import { useState } from "react";

import { 
  Avatar, 
  AvatarImage, 
  AvatarFallback, 
  AvatarGroup, 
  AvatarGroupCount,
  Button,
  Input,
  Typography
} from "@/components/atoms";

import { cn, BreadcrumbProps } from "@/lib";
import { Member } from "@/types";

interface DailyLogNavbarProps {
  members?: Member[];
  onSearch?: (query: string) => void;
  searchResults?: { _id: string; title: string; date: number }[];
  onResultClick?: (date: Date) => void;
  rightActions?: React.ReactNode;
  breadcrumbs?: BreadcrumbProps[];
  onBack?: () => void;
  className?: string;
}


export const DailyLogNavbar = ({
  members = [],
  onSearch,
  searchResults = [],
  onResultClick,
  rightActions,
  onBack,
  className
}: DailyLogNavbarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");

  const displayMembers = members.slice(0, 3);
  const remainingCount = Math.max(0, members.length - 3);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  }

  const handleResultClick = (date: number) => {
    onResultClick?.(new Date(date));
    setQuery("");
    setIsFocused(false);
  }

  return (
    <nav className={cn(
      "h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50",
      className
    )}>
      <div className="flex items-center gap-x-2 md:gap-x-6 flex-1 min-w-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        <div className="max-w-30 sm:max-w-45 md:max-w-xs w-full relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
            <Search className="h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input
            type="text"
            placeholder="Search logs..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 300);
            }}
            className="w-full bg-muted/40 hover:bg-muted/60 focus:bg-background h-9 pl-9 pr-2 md:pr-4 rounded-xl text-xs border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none text-ellipsis"
          />

          {isFocused && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-100">
              <div className="p-2 border-b bg-muted/30">
                <Typography className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  Search Results
                </Typography>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={result._id}
                      role="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleResultClick(result.date);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-muted cursor-pointer transition-colors flex items-center gap-x-3 group/item border-b border-border/30 last:border-0"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-semibold truncate group-hover/item:text-primary transition-colors">
                          {result.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(result.date, "dd MMMM yyyy")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <Typography className="text-xs text-muted-foreground italic">
                      No matching logs found
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>



        <div className="flex items-center gap-x-2 shrink-0">
          <div className="flex items-center gap-x-2 md:gap-x-3">
             <AvatarGroup className="hidden sm:flex">
                {displayMembers.map((member) => (
                  <Avatar key={member._id} size="sm" className="border-2 border-background ring-1 ring-border/50">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback className="text-[10px]">{member.fullName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                ))}
                {remainingCount > 0 && (
                  <AvatarGroupCount className="bg-muted text-[10px] font-bold">
                    +{remainingCount}
                  </AvatarGroupCount>
                )}
             </AvatarGroup>
             
             {rightActions}

          </div>
        </div>

    </nav>
  );
};
