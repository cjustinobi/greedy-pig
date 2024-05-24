
import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { vUpdateGame } from './validators'

export const getUserJoining = query({
  handler: async ({ db }) => {
    return (await db.query('game').first())?.userJoining
  }
})

export const getUserPlaying = query({
  handler: async ({ db }) => {
    return (await db.query('game').first())?.userPlaying
  }
})

export const updateGame = mutation({
  args: { 
    gameId: v.id('game'),
    data: vUpdateGame,
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId)
    if (!game) {
      throw new Error("Game not found")
    }

    const updatedGame = {
      ...game,
      ...args.data
    };

    await ctx.db.replace(args.gameId, updatedGame)
    return updatedGame
  }
})
// export const updateGame = mutation({
//   args: {data: vUpdateGame},
//   handler: async () => {
    
//   }
// })