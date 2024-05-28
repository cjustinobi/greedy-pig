
import { mutation, query } from './_generated/server'
import { vUpdateGame } from './validators'

export const getUserJoining = query({
  handler: async ({ db }) => {
    return (await db.query('test').first())?.userJoining
  }
})

export const getUserPlaying = query({
  handler: async ({ db }) => {
    return (await db.query('test').first())?.userPlaying
  }
})

export const updateGame = mutation({
  args: { 
    // gameId: v.id('test'),
    data: vUpdateGame,
  },
  handler: async ({db}, args) => {
    // const game = await ctx.db.get(args.gameId)
    const game = await db.query('test').first()
    if (!game) {
      throw new Error("Game not found")
    }

    const updatedGame = {
      ...game,
      ...args.data
    };

    await db.replace(game._id, updatedGame)
    return updatedGame
  }
})