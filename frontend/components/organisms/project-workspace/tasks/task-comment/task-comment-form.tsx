"use client";

import React from "react";
import { Send, Loader2, X } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

import { 
  Typography, 
  Button 
} from "@/components/atoms";
import { MentionTextarea, MentionUser } from "@/components/molecules";

import { cn } from "@/lib";
import { layouts, patterns, tokens } from "@/lib/styles";

interface TaskCommentFormProps {
  content: string;
  setContent: (content: string) => void;
  setMentionedIds: (ids: Id<"users">[]) => void;
  isSubmitting: boolean;
  replyTo: { id: Id<"taskComments">; name: string } | null;
  setReplyTo: (replyTo: { id: Id<"taskComments">; name: string } | null) => void;
  mentionUsers: MentionUser[]; 
  onSubmit: (e: React.FormEvent) => void;
  onKeyDownSubmit: () => void;
}

export const TaskCommentForm = ({
  content,
  setContent,
  setMentionedIds,
  isSubmitting,
  replyTo,
  setReplyTo,
  mentionUsers,
  onSubmit,
  onKeyDownSubmit,
}: TaskCommentFormProps) => {
  return (
    <form onSubmit={onSubmit} className="relative group">
      <div className={patterns.formContainer}>
        {replyTo && (
          <div className={cn(
            layouts.flexBetween,
            "px-4 py-2 border-b border-border/10 animate-in slide-in-from-top-1",
            tokens.surface.info
          )}>
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-primary rounded-full" />
              <Typography className={cn(patterns.textTinyCaps, "text-primary tracking-wider")}>
                Replying to <span className="text-foreground">{replyTo.name}</span>
              </Typography>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className={cn(tokens.size.actionXs, "hover:bg-primary/10 text-primary")}
              onClick={() => setReplyTo(null)}
            >
              <X className={tokens.size.iconXs} />
            </Button>
          </div>
        )}
        <MentionTextarea 
          value={content}
          onChange={(val, ids) => {
            setContent(val);
            setMentionedIds(ids as Id<"users">[]);
          }}
          placeholder={replyTo ? "Write a reply..." : "Write a comment with Markdown or @mention..."}
          users={mentionUsers}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onKeyDownSubmit();
            }
          }}
        />
        <div className="flex items-center justify-end px-4 py-2 border-t border-border/10 bg-muted/10 gap-4">
          <Typography className={cn(patterns.textMeta, "hidden sm:block font-medium")}>
            Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border/50 text-[9px]">Ctrl + Enter</kbd> to send
          </Typography>
          <Button 
            type="submit" 
            size="sm" 
            disabled={!content.trim() || isSubmitting}
            className={cn(
              "h-8 rounded-lg px-4 bg-primary hover:bg-primary/90 transition-all active:scale-95",
              tokens.shadow.md,
              "shadow-primary/20"
            )}
          >
            {isSubmitting ? (
              <Loader2 className={cn(tokens.size.iconMd, "animate-spin")} />
            ) : (
              <>
                <Send className={cn(tokens.size.iconSm, "mr-2")} />
                {replyTo ? "Reply" : "Send"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
