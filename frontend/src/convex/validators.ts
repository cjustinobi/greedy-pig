import { v } from 'convex/values'
// import { GameStatus } from '../interfaces'

export const vUpdateGame = v.object({
  userJoining: v.optional(v.boolean()),
  userPlaying: v.optional(v.boolean())
})

// export const vCreateGame = v.object({
//     activePlayer: v.string(),
//     creator: v.string(),
//     gameName: v.string(),
//     gameSettings: v.object({
//       apparatus: v.string(),
//       bet: v.boolean(),
//       limitNumberOfPlayer: v.boolean(),
//       maxPlayer: v.float64(),
//       mode: v.string(),
//       turnTimeLimit: v.float64(),
//       winningScore: v.float64(),
//     }),
//     participants: v.array(
//       v.object({
//         address: v.optional(v.string()),
//         playerInfo: v.optional(v.object({
//           totalScore: v.float64(),
//           turn: v.float64(),
//           turnScore: v.float64(),
//         })),
//     })
//     ),
//     status: v.union(v.literal(GameStatus.New), v.literal(GameStatus.Cancelled), v.literal(GameStatus.Ended), v.literal(GameStatus.InProgress)),
//     startTime: v.string()
//   })

// export const vAddParticipant = v.object({
//   id: v.id('games'),
//   playerAddress: v.string()
// })


