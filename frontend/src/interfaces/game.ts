import { GameStatus } from "./convex"

export interface IGame {
  id: number
  gameName: string
  status: GameStatus
  participants: any
  gameSettings: {
    bet: boolean
    betAmount: number
    apparatus: string
  }
}
