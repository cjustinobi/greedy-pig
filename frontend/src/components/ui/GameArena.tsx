import LeaderBoard from './Leaderboard'
import { dappAddress, shortenAddress } from '@/lib/utils'
import { useRollups } from '@/hooks/useRollups'
import { useCallback, useEffect, useState } from 'react'
import Settings from './Settings'
import Dice from './Dice'
import { useQuery, gql } from '@apollo/client'
import { ethers } from 'ethers'
import { useDispatch } from 'react-redux'
import { useConnectWallet } from '@web3-onboard/react'

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
    pollInterval: 1000,
  })
  const [{ wallet }] = useConnectWallet()
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
          const parsedPayload = JSON.parse(noticePayload)

          if (Array.isArray(parsedPayload)) {
            const game = parsedPayload.find((game: any) => game.id == gameId)

            if (game) {
              console.log('Game found:', game)
              dispatchGameData(game)
            }
          } else {
            console.warn('Parsed payload is not an array:', parsedPayload)
          }
        }
      }
    }
  }, [data, dispatchGameData, error, loading])

  useEffect(() => {
    
    const handleInputAdded = () => {
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
          {/* <Vouchers dappAddress={dappAddress} /> */}
          {game && game.status === 'Ended' ? (
            <p>Game Ended </p>
          ) : (
            <p>
              {' '}
              {game?.activePlayer
                ? `${shortenAddress(game?.activePlayer)}'s turn`
                : ''}{' '}
            </p>
          )}
          {/*game?.commitPhase && (
            <p className="text-center">
              Players Commiting ...
              {game.participants.filter((p: any) => p.commitment).length}/
              {game.participants.length}
            </p>
          )*/}
          {/*game?.revealPhase && (
            <p className="text-center">
              Players Revealing ...
              {game.participants.filter((p: any) => p.move).length}/
              {game.participants.length}
            </p>
          )*/}
          {game &&
            game.status === 'New' &&
            wallet &&
            game.activePlayer !== wallet?.accounts[0].address && (
              <span className="text-center">Game not Started</span>
            )}
          {game &&
            game.status === 'New' &&
            wallet &&
            game.activePlayer === wallet?.accounts[0].address && (
              <span className="text-center">Start game</span>
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

