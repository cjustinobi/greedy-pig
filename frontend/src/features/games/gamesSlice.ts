import { PayloadAction, createSlice } from '@reduxjs/toolkit'

function extractParticipantAddresses(gameState: GameState): string[] {
  if (!gameState || !gameState.participants) {
    return [] // Handle missing or empty participants list gracefully
  }

  return gameState.participants.map((participant) => participant.address)
}
interface GameState {
  _id: string // Automatically generated by Convex
  activePlayer: string
  creator: string
  gameName: string
  gameSettings: {
    apparatus: string
    bet: boolean
    limitNumberOfPlayer: boolean
    maxPlayer: number // Use number instead of float64
    mode: string
    numbersOfTurn: number // Use number instead of float64
    winningScore: number // Use number instead of float64
  }
  participants: {
    address: string
    playerInfo: {
      totalScore: number // Use number instead of float64
      turn: number // Use number instead of float64
      turnScore: number // Use number instead of float64
    }
  }[]
  startTime: string
  status: 'New' | 'In Progress' | 'Ended' | 'Cancelled'
  id: string
  startAngle: number
  bettingAmount: number
  bettingFund: number
  winner: string
  rollOutcome: number
}

interface State {
  selectedGame: GameState
}

const gamesSlice = createSlice({
  name: 'games',
  initialState: {
    selectedGame: {},
  },
  reducers: {
    setGame: (state, action: PayloadAction<GameState>) => {
      state.selectedGame = action.payload
    },
  },
})

export const selectParticipantAddresses = (state: State) => {
  if (!state.selectedGame) {
    return [] // Return empty array if no selected game
  }

  return extractParticipantAddresses(state.selectedGame)
}

export const selectSelectedGame = (state: State) => state.selectedGame

export const { setGame } = gamesSlice.actions

export default gamesSlice.reducer
