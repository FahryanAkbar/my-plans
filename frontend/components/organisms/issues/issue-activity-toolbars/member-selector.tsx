"use client";

import React from "react";
import { User, Filter, Check } from "lucide-react";
import { cn } from "@/lib";
import { 
  Button, 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Typography
} from "@/components/atoms";
import { ProjectMember } from "@/types/features";

interface MemberSelectorProps {
  selectedMemberId: string;
  onMemberChange: (id: string) => void;
  members: ProjectMember[];
}

export const MemberSelector = ({
  selectedMemberId,
  onMemberChange,
  members
}: MemberSelectorProps) => {
  const selectedMember = members.find(m => m.userId === selectedMemberId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-lg border-border/40 bg-muted/30 text-muted-foreground/60 h-8 px-2 pl-3 hover:bg-muted/50 text-[11px] font-bold gap-2 group transition-all">
          {selectedMemberId === "all" ? (
            <User className="h-3 w-3" />
          ) : (
            <Avatar className="h-5 w-5 border border-background">
              <AvatarImage src={selectedMember?.imageUrl} />
              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                {selectedMember?.fullName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="group-hover:text-foreground transition-colors">
            {selectedMemberId === "all" ? "All members" : selectedMember?.fullName}
          </span>
          <Filter className="h-2.5 w-2.5 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-72 rounded-3xl overflow-hidden shadow-2xl border-border/40 bg-card/95 backdrop-blur-xl" align="start">
        <Command className="bg-transparent">
          <div className="p-3 pb-2 border-b border-border/10">
            <CommandInput 
              placeholder="Search Members" 
              className="h-9 bg-muted/20 border-none rounded-xl focus:bg-muted/40 transition-all text-xs" 
            />
          </div>

          <CommandList className="p-1.5 max-h-87.5">
            <CommandEmpty className="py-8 text-xs text-muted-foreground italic text-center">No Member has Found.</CommandEmpty>
            
            <div className="px-2 py-1.5">
              <Typography className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">All</Typography>
            </div>
            <CommandGroup>
              <CommandItem 
                onSelect={() => onMemberChange("all")}
                className={cn(
                  "text-xs gap-3 py-2 px-2.5 rounded-2xl cursor-pointer transition-all mb-0.5 group",
                  selectedMemberId === "all" ? "bg-primary/5 text-primary" : "hover:bg-muted/40"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full transition-colors",
                  selectedMemberId === "all" ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                )}>
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="flex-1 font-bold text-[12px]">All members</span>
                <div className={cn(
                  "h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all",
                  selectedMemberId === "all" 
                    ? "bg-green-500 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                    : "border-muted-foreground/20"
                )}>
                  {selectedMemberId === "all" && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
                </div>
              </CommandItem>
            </CommandGroup>

            <div className="h-px bg-border/5 my-1 mx-2" />

            <div className="px-2 py-1.5">
              <Typography className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Member</Typography>
            </div>
            <CommandGroup>
              {members.map((member) => (
                <CommandItem 
                  key={member.userId}
                  onSelect={() => onMemberChange(member.userId)}
                  className={cn(
                    "text-xs gap-3 py-2 px-2.5 rounded-2xl cursor-pointer transition-all mb-0.5 group",
                    selectedMemberId === member.userId ? "bg-primary/5 text-primary" : "hover:bg-muted/40"
                  )}
                >
                  <Avatar className="h-8 w-8 border border-border/10 shadow-sm transition-transform group-hover:scale-105">
                    <AvatarImage src={member.imageUrl} />
                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                      {member.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-[12px] text-foreground/90 leading-tight">{member.fullName}</span>
                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-wider">
                      {member.role || member.position || "Member"}
                    </span>
                  </div>
                  <div className={cn(
                    "h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedMemberId === member.userId 
                      ? "bg-green-500 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                      : "border-muted-foreground/20 group-hover:border-muted-foreground/40"
                  )}>
                    {selectedMemberId === member.userId && <Check className="h-2.5 w-2.5 text-white stroke-[3px]" />}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          <div className="p-3 bg-muted/10 border-t border-border/10 flex items-center justify-between gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[11px] font-bold text-muted-foreground hover:text-foreground h-8 px-3 rounded-lg"
              onClick={() => onMemberChange("all")}
            >
              Reset
            </Button>
            <Button 
              size="sm" 
              className="bg-foreground text-background hover:bg-foreground/90 text-[11px] font-bold h-8 px-5 rounded-full shadow-lg transition-all active:scale-95"
            >
              Terapkan
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
