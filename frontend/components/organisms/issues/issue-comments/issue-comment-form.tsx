"use client";

import React from "react";
import { Send, Loader2, X } from "lucide-react";
import { 
  Button, 
  Typography 
} from "@/components/atoms";
import { MentionTextarea } from "@/components/molecules";

import { Id } from "@/convex/_generated/dataModel";
import { MentionUser } from "@/components/molecules";

interface IssueCommentFormProps {
  content: string;
  setContent: (content: string) => void;
  setMentionedIds: (ids: Id<"users">[]) => void;
  isSubmitting: boolean;
  replyTo: { id: Id<"issueComments">; name: string } | null;
  setReplyTo: (replyTo: { id: Id<"issueComments">; name: string } | null) => void;
  mentionUsers: MentionUser[];
  submitComment: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => void;
}

export const IssueCommentForm = ({
  content,
  setContent,
  setMentionedIds,
  isSubmitting,
  replyTo,
  setReplyTo,
  mentionUsers,
  submitComment,
  handleSubmit,
}: IssueCommentFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="relative rounded-2xl border border-border/50 bg-muted/20 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300">
        {replyTo && (
          <div className="flex items-center justify-between px-4 py-2 bg-primary/5 border-b border-border/10 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-primary rounded-full" />
              <Typography className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Replying to <span className="text-foreground">{replyTo.name}</span>
              </Typography>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 hover:bg-primary/10 text-primary"
              onClick={() => setReplyTo(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <MentionTextarea 
          value={content}
          onChange={(val, ids) => {
            setContent(val);
            setMentionedIds(ids);
          }}
          placeholder={replyTo ? "Write a reply..." : "Write a comment with Markdown or @mention..."}
          users={mentionUsers}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              void submitComment();
            }
          }}
        />
        <div className="flex items-center justify-end px-4 py-2 border-t border-border/10 bg-muted/10 gap-4">
          <Typography className="text-[10px] text-muted-foreground font-medium hidden sm:block">
            Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border/50 text-[9px]">Ctrl + Enter</kbd> to send
          </Typography>
          <Button 
            type="submit" 
            size="sm" 
            disabled={!content.trim() || isSubmitting}
            className="h-8 rounded-lg px-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-2" />
                {replyTo ? "Reply" : "Send"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
