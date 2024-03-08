'use client'
import { FC, useState, useEffect, useRef } from 'react'
import ReactDice, { ReactDiceRef } from 'react-dice-complete'
import { useConnectWallet } from '@web3-onboard/react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Button from '@/components/shared/Button'
import { useRollups } from '@/hooks/useRollups'
import { dappAddress, parseInputEvent } from '@/lib/utils'
import { addInput } from '@/lib/cartesi'
import {
  selectParticipantAddresses,
  selectSelectedGame,
} from '@/features/games/gamesSlice'

interface RouletteProps {
  notices: any
}

const MyDiceApp: FC<RouletteProps> = ({ notices }) => {
  const dispatch = useDispatch()
  const [{ wallet }] = useConnectWallet()
  const rollups = useRollups(dappAddress)
  const reactDice = useRef<ReactDiceRef>(null)

  const game = useSelector((state: any) => selectSelectedGame(state.games))
  const players = useSelector((state: any) =>
    selectParticipantAddresses(state.games)
  )

  const [gameId, setGameId] = useState<string>()

  const rollDone = (totalValue: number) => {
    console.log('total dice value:', totalValue)
  }

  const handleResponse = (response: string) => {
    playGame(response)
  }

  const playGame = async (response: string) => {
    const playerAddress = wallet?.accounts[0].address

    if (game.status === 'Ended') {
      return toast.error('Game has ended')
    }

    if (game.activePlayer !== playerAddress) {
      return toast.error('Not your turn')
    }

    if (!playerAddress) return toast.error('Player not connected')

    if (players.length >= 2) {
      const playerAddress = wallet?.accounts[0].address

      // game.status === 'New' ? dispatch({ type: 'leaderboard/initTurnSync', payload: true}) : ''

      try {
        const jsonPayload = JSON.stringify({
          method: 'playGame',
          data: { gameId, playerAddress, response },
        })

        const tx = await addInput(
          JSON.stringify(jsonPayload),
          dappAddress,
          rollups
        )

        console.log('dice tx ', tx)
        const result = await tx.wait(1)
        console.log('result for the game ', result)
      } catch (error) {
        console.error('Error during game:', error)
      }
    } else {
      toast.error('Not enough players to play')
    }
  }
  // game.participants.map((participant: any) => participant.address)
  useEffect(() => {
    rollups?.inputContract.on(
      'InputAdded',
      (dappAddress, inboxInputIndex, sender, input) => {
        if (parseInputEvent(input).method === 'playGame') {
          if (notices && notices.length > 0) {
            // const game = JSON.parse(notices[notices.length - 1].payload).find(
            //   (game: any) => game.id === gameId
            // )
            if (game) {
              // setGame(game)

              // setActivePlayer(game.activePlayer)
              // const gameParticipants = game.participants.map((participant: any) => participant.address);
              // setPlayers(gameParticipants);

              if (game.status === 'Ended')
                return toast.success('Game has ended')
              // audio.play(); // Play the audio when the game is over

              console.log('playgame rolloutcome ', game.rollOutcome)
              if (game.rollOutcome !== 0) {
                console.log('the game ', game)
                console.log('the notices ', notices)
                reactDice.current?.rollAll([game.rollOutcome])
              }
            }
          }
        }
      }
    )
  }, [rollups, game, notices])

  return (
    <div>
      {/* <h2 onClick={rollAll}>Rollll</h2> */}
      <div className="relative">
        <ReactDice
          numDice={1}
          ref={reactDice}
          rollDone={rollDone}
          disableIndividual={true}
          dieSize={140}
        />
      </div>

      {game && game.status !== 'Ended' && (
        <div className="flex justify-start gap-11 top-[100px] relative mb-6">
          <Button type="button" id="spin" onClick={() => handleResponse('yes')}>
            Roll
          </Button>
          <div className="bg-gradient-to-r cursor-pointer text-center from-pink-500 via-red-500 to-yellow-500 p-1 rounded-2xl">
            <div className="w-[130px] bg-black rounded-2xl">
              <button
                type="button"
                id="spin"
                onClick={() => handleResponse('no')}
                className="cursor-pointer text-center font-bold p-2"
              >
                Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* <ConfirmModal onSubmit={handleResponse} activePlayer={activePlayer} /> */}
    </div>
  )
}

export default MyDiceApp
