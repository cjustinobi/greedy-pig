import { GameStatus } from '../interfaces';
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { vUpdateGame } from './validators';

export const getUserJoining = query({
  handler: async ({ db }) => {
    return (await db.query('game').first())?.userJoining
  },
})

export const updateGame = mutation({
  args: { 
    gameId: v.id("game"),  // Game ID argument
    data: vUpdateGame,     // Update data (using your validator)
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);  // Fetch the game
    if (!game) {
      throw new Error("Game not found"); 
    }

    const updatedGame = {
      ...game,
      ...args.data
    };

    await ctx.db.replace(args.gameId, updatedGame); // Replace the game document with the updated data
    return updatedGame; // Optionally, return the updated game
  },
});
// export const updateGame = mutation({
//   args: {data: vUpdateGame},
//   handler: async () => {
    
//   }
// })