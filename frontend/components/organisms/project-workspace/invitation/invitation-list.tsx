"use client";

import * as React from "react";
import { Clock, ShieldCheck } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Badge,
  Avatar,
  AvatarFallback,
  Button
} from "@/components/atoms";
import { cn, formatDate } from "@/lib";

interface InvitationListProps {
  invitations: Doc<"projectInvitations">[];
  onCancel?: (id: string) => void;
  className?: string;
}

export const InvitationList = ({
  invitations,
  onCancel,
  className,
}: InvitationListProps) => {
  const pendingCount = invitations.filter((inv) => inv.status.toLowerCase() === "pending").length;

  return (
    <Card className={cn("bg-card shadow-none border border-border/40 rounded-xl overflow-hidden flex flex-col", className)}>
      <CardHeader className="px-6 py-4 border-b border-border/40 space-y-0.5">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
          Invitations
        </CardTitle>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
          <span>{invitations.length} total</span>
          <span className="text-muted-foreground/30">•</span>
          <span>{pendingCount} pending</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col divide-y divide-border/40">
          {invitations.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground/50 text-xs italic">
              No invitations found
            </div>
          ) : (
            invitations.map((invitation) => (
              <div 
                key={invitation._id} 
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/5 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar className="h-10 w-10 border border-border/20 shadow-sm">
                    <AvatarFallback className="bg-muted/30 text-muted-foreground/70 text-xs font-bold">
                      {invitation.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground/90 truncate">
                      {invitation.email}
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 font-medium">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        {invitation.role}
                      </div>
                      <span className="text-border/60">•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(invitation.createdAt).split(',')[0]}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-[9px] uppercase font-bold px-2 py-0.5 leading-none rounded-full border-none",
                      invitation.status.toLowerCase() === "pending" && "bg-amber-500/10 text-amber-600/80",
                      invitation.status.toLowerCase() === "accepted" && "bg-emerald-500/10 text-emerald-600/80",
                      invitation.status.toLowerCase() === "revoked" && "bg-muted/50 text-muted-foreground/70"
                    )}
                  >
                    {invitation.status}
                  </Badge>
                  
                  {onCancel && (invitation.status.toLowerCase() === "pending" || invitation.status.toLowerCase() === "accepted") && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onCancel(invitation._id)}
                      className="h-8 px-4 rounded-lg text-xs font-bold bg-muted/20 hover:bg-muted/50 border-border/40 hover:border-border/60 transition-all"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
