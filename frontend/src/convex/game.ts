
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
    // gameId: v.id('game'),
    data: vUpdateGame,
  },
  handler: async ({db}, args) => {
    // const game = await ctx.db.get(args.gameId)
    const game = await db.query('game').first()
    if (!game) {
      throw new Error("Game not found")
    }

    // get the first game ID


    const updatedGame = {
      ...game,
      ...args.data
    };

    await db.replace(game._id, updatedGame)
    return updatedGame
  }
})
        
//   }
// })//   }
// })