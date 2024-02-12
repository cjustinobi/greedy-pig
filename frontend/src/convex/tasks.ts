import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const send = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    // Send a new message.
    await ctx.db.insert("tasks", { text, isCompleted: false });
  },
});