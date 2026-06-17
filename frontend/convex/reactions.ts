import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUserOrThrow } from "../lib/utils/rbac";

export const toggle = mutation({
  args: {
    commentId: v.id("taskComments"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    const existing = await ctx.db
      .query("commentReactions")
      .withIndex("by_comment_user_emoji", (q) => 
        q.eq("commentId", args.commentId)
         .eq("userId", user._id)
         .eq("emoji", args.emoji)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { action: "removed", emoji: args.emoji };
    } else {
      await ctx.db.insert("commentReactions", {
        commentId: args.commentId,
        userId: user._id,
        emoji: args.emoji,
        createdAt: Date.now(),
      });
      return { action: "added", emoji: args.emoji };
    }
  },
});
