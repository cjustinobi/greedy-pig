import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'


export default defineSchema({
  game: defineTable({
    userJoining: v.optional(v.boolean()),
    userPlaying: v.optional(v.boolean())
  }),
  test: defineTable({
    userJoining: v.optional(v.boolean()),
    userPlaying: v.optional(v.boolean())
  })
})
