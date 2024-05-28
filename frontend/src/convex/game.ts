
import { mutation, query } from './_generated/server'
import { vUpdateGame } from './validators'

export const createGame = mutation({
  args: {},
  handler: async ({ db }) => {
    const game = {
      userJoining: false,
      userPlaying: false,
    }
    await db.insert('game', game)
    return game
  }
})

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
    data: vUpdateGame,
  },
  handler: async ({db}, args) => {

    const game = await db.query('game').first()
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