'use client'
import { FC, useState, useEffect } from 'react'
import { useConnectWallet } from '@web3-onboard/react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Button from '@/components/shared/Button'
import { useRollups } from '@/hooks/useRollups'
import { dappAddress, parseInputEvent } from '@/lib/utils'
import { addInput } from '@/lib/cartesi'
import { Wallet } from 'cartesi-wallet'
import {
  selectParticipantAddresses,
  selectSelectedGame,
} from '@/features/games/gamesSlice'
import Dice from '@/components/ui/Dice'
import useAudio from '@/hooks/useAudio'

interface RouletteProps {
  // notices: any
}

const myWallet = new Wallet(new Map())

const Apparatus: FC<RouletteProps> = () => {
  const loseSound = useAudio('/sounds/loseSound.mp3')
  const dispatch = useDispatch()
  const [{ wallet }] = useConnectWallet()
  const rollups = useRollups(dappAddress)

  const game = useSelector((state: any) => selectSelectedGame(state.games))
  const players = useSelector((state: any) =>
    selectParticipantAddresses(state.games)
  )

  const [isRolling, setIsRolling] = useState(false)
  const [value, setValue] = useState(0)
  const [gameId, setGameId] = useState<string>('')

  const handleResponse = (response: string) => {
    playGame(response)
  }

  const playGame = async (response: string) => {
    const playerAddress = wallet?.accounts[0].address

    if (!playerAddress) return toast.error('Connect account')

    if (game.status === 'Ended') {
      return toast.error('Game has ended')
    }

    if (game.activePlayer !== playerAddress) {
      return toast.error('Not your turn')
    }

    if (players.length >= 2) {
      const playerAddress = wallet?.accounts[0].address

      try {

        const jsonPayload = JSON.stringify({
          method: 'playGame',
          data: { gameId: game.id, playerAddress, response },
        })

        const tx = await addInput(
          JSON.stringify(jsonPayload),
          dappAddress,
          rollups
        )

        const result = await tx.wait(1)
        console.log('tx for the game ', result)
      } catch (error) {
        console.error('Error during game:', error)
      }
    } else {
      toast.error('Not enough players to play')
    }
  }

    // const betGame = async (id: any) => {
    //   // const res = await sendEther(1, rollups)

    //    const jsonPayload = JSON.stringify({
    //      method: 'transfer',
    //      from: wallet?.accounts[0].address,
    //      to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    //      ether: '0xFfdbe43d4c855BF7e0f105c400A50857f53AB044',
    //      amount: 2
    //    })


    //    const tx = await sendEther(1, rollups, jsonPayload)

    //    console.log(tx)

    // }

  const joinGame = async (id: any) => {

    const addr: string | undefined = wallet?.accounts[0].address

    const jsonPayload = JSON.stringify({
      method: 'addParticipant',
      data: { gameId: id, playerAddress: addr },
    })

    const tx = await addInput(
      JSON.stringify(jsonPayload),
      dappAddress,
      rollups
    )

    const result = await tx.wait(1)
    console.log(result)

  }

  useEffect(() => {
    const id = window.location.pathname.split('/').pop()
    if (id) {
      setGameId(id)
    }
  }, [gameId])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined

    rollups?.inputContract.on(
      'InputAdded',
      (dappAddress, inboxInputIndex, sender, input) => {
        // clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (
            parseInputEvent(input).method === 'playGame' &&
            game.rollOutcome !== 0
          ) {

            setValue(game.rollOutcome)
            setIsRolling(true)
          } else {
            loseSound?.play()
            setValue(1)
          }
        }, 7000)
      }
    )
  }, [game, rollups])

  return (
    <div className="w-[300px]">
      <div className="flex justify-center mb-[60px]">
        <Dice
          handleDiceClick={() => handleResponse('yes')}
          isRolling={isRolling}
          setIsRolling={setIsRolling}
          value={value}
        />
      </div>

      <div className="flex justify-center">
        {game &&
          game.status === 'New' &&
          wallet &&
          !players.includes(wallet.accounts[0].address) && (
            <div>
              <Button
                onClick={() => joinGame(gameId)}
                className="mb-10"
                type="button"
              >
                Join Game
              </Button>

            </div>
          )}
        {game && game.status === 'In Progress' && (
          <div className="flex justify-between">
            <Button
              className="pass-btn"
              style={{ background: '' }}
              onClick={() => handleResponse('no')}
            >
              Pass
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Apparatus
