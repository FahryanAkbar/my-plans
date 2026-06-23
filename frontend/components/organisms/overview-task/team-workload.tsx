"use client";

import { Users } from "lucide-react";
import { 
  Typography, 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
  Progress,
  Badge,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardAction
} from "@/components/atoms";
import { OverviewTaskSkeleton } from "@/components/organisms";


import { Id } from "@/convex/_generated/dataModel";
import { useTeamWorkload } from "@/hooks";
import { cn, getMemberWorkloadConfig } from "@/lib";

interface TeamWorkloadProps {
  projectId: Id<"projects">;
  className?: string;
}

export const TeamWorkload = ({
  projectId,
  className
}: TeamWorkloadProps) => {
  const { data: members, isLoading } = useTeamWorkload(projectId);

  if (isLoading) {
    return (
      <OverviewTaskSkeleton 
        itemCount={3} 
        titleWidth="w-48" 
        variant="list" 
        className={className} 
      />
    )
  }

  return (
    <Card className={cn("bg-card border border-border/60 flex flex-col shadow-none", className)}>
      <CardHeader className="pb-2 shrink-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          TEAM WORKLOAD
        </CardTitle>
        <CardAction>
          <Typography className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            {members?.length || 0} members
          </Typography>
        </CardAction>
      </CardHeader>

      <CardContent 
        className="flex-1 overflow-y-auto scrollbar-hide pt-0 pr-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {(!members || members.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
            <Users className="h-12 w-12 mb-4" />
            <Typography className="text-[10px] font-bold uppercase tracking-[0.3em]">
              No team members found
            </Typography>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {members.map((member) => {
              const statusConfig = getMemberWorkloadConfig(member.status);
              
              return (
                <div 
                  key={member.userId} 
                  className="py-5 group animate-in fade-in slide-in-from-bottom-2 duration-500"
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Avatar & Info */}
                    <div className="flex items-center gap-x-3 min-w-0">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-sm transition-all group-hover:scale-105">
                        <AvatarImage src={member.imageUrl} />
                        <AvatarFallback className="bg-muted text-foreground font-bold text-[10px] uppercase">
                          {member.fullName.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <Typography className="text-sm font-semibold tracking-tight truncate text-foreground">
                          {member.fullName}
                        </Typography>
                        <Typography className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                          {member.role}
                        </Typography>
                      </div>
                    </div>

                    {/* Right: Stats & Status */}
                    <div className="flex flex-col items-end gap-y-2 shrink-0">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-x-3 mb-1">
                          <div className="flex items-center gap-x-1.5">
                            <div className="h-1 w-1 rounded-full bg-primary" />
                            <Typography className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-tight">
                              {member.activeTasks} active
                            </Typography>
                          </div>
                          <div className="flex items-center gap-x-1.5">
                            <div className="h-1 w-1 rounded-full bg-emerald-500" />
                            <Typography className="text-[9px] font-bold text-muted-foreground/80 uppercase tracking-tight">
                              {member.doneTasks} done
                            </Typography>
                          </div>
                        </div>
                        <Progress 
                          value={member.progress} 
                          className="h-1 w-24 bg-muted/30 rounded-full" 
                        />
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border-none", 
                          statusConfig.color.replace('text-', 'bg-').replace('600', '600/10'),
                          statusConfig.color
                        )}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};