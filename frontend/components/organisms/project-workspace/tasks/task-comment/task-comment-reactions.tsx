import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { EmojiReactionPicker } from "@/components/molecules";

import { cn } from "@/lib";
import { patterns, tokens } from "@/lib/styles";
import { ReactionData } from "@/types/features";

interface TaskCommentReactionsProps {
  commentId: Id<"taskComments">;
  reactions: ReactionData[];
  onReaction: (commentId: Id<"taskComments">, emoji: string) => void;
}

export const TaskCommentReactions = ({ 
  commentId, 
  reactions, 
  onReaction 
}: TaskCommentReactionsProps) => (
  <div className="flex flex-wrap gap-1 mt-2">
    {reactions?.map((reaction) => (
      <button
        key={reaction.emoji}
        onClick={() => onReaction(commentId, reaction.emoji)}
        className={cn(
          patterns.reactionPill,
          reaction.hasReacted 
            ? patterns.reactionActive 
            : patterns.reactionInactive
        )}
      >
        <span>{reaction.emoji}</span>
        <span>{reaction.count}</span>
      </button>
    ))}
    <EmojiReactionPicker 
      onSelect={(emoji) => onReaction(commentId, emoji)} 
      className={cn(tokens.size.actionXs, "rounded-full hover:bg-muted/50")}
    />
  </div>
);
