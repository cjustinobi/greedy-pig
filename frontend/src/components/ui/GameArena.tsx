import LeaderBoard from './Leaderboard'
import { dappAddress, shortenAddress } from '@/lib/utils'
import { useRollups } from '@/hooks/useRollups'

import { memo, useCallback, useEffect, useState } from 'react'
import Settings from './Settings'
import Dice from './Dice'
import { useQuery, gql } from '@apollo/client'
import { ethers } from 'ethers'
import { useDispatch } from 'react-redux'
// const MemoizedLeaderBoard = memo(LeaderBoard)

const GET_LATEST_NOTICE = gql`
  query latestNotice {
    notices(last: 1) {
      edges {
        node {
          payload
        }
      }
    }
  }
`

const GameArena = () => {

  const { loading, error, data, refetch } = useQuery(GET_LATEST_NOTICE, {
    pollInterval: 500,
  })
  const rollups = useRollups(dappAddress)
  const dispatch = useDispatch()

  const [game, setGame] = useState<any>()

  const dispatchGameData = useCallback((game: any) => {
    console.log('gamearena game', game)
    setGame(game)
    dispatch({ type: 'games/setGame', payload: game })
  }, [])

  useEffect(() => {

    const gameId = window.location.pathname.split('/').pop()
    if (loading) {
      console.log('Loading notices')
    }
    if (error) {
      console.error(`Error querying Query Server: ${JSON.stringify(error)}`)
    }

    if (data) {
      const latestNotice = data.notices.edges[0]

      if (latestNotice) {
        const noticePayload = ethers.utils.toUtf8String(
          latestNotice.node.payload
        )

        if (gameId) {
          const game = JSON.parse(noticePayload)
            .find((game: any) => game.id === gameId)
           
          if (game) {
            console.log('Game found:', game)
            dispatchGameData(game)
          }
        }
      }
    }
  }, [data, dispatchGameData, error, loading])

  // Handle inputAdded event to trigger refetch
  useEffect(() => {
    
    const handleInputAdded = () => {
      console.log('Input added, refetching notices')
      refetch()
    }

    // Add event listener for inputAdded event
    rollups?.inputContract.on('InputAdded', handleInputAdded)

    // Cleanup function to remove event listener
    return () => {
      rollups?.inputContract.off('InputAdded', handleInputAdded)
    }
  }, [rollups, refetch])

  return (
    <div className="py-6 sm:py-8 lg:py-12">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col items-center gap-4  px-8 py-6 md:gap-6">
          {game?.activePlayer && (
            <p>{shortenAddress(game?.activePlayer)}'s turn</p>
          )}
          <Dice game={game} />
        </div>
        <div className="flex flex-col items-center gap-4 md:gap-6">
          <LeaderBoard game={game} />
        </div>
      </div>
      <Settings />
    </div>
  )
}

export default GameArena

