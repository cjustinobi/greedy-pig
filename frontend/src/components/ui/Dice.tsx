import { FC, useEffect, useState } from 'react'
import Die1 from '@/assets/img/dice_1.png'
import Die2 from '@/assets/img/dice_2.png'
import Die3 from '@/assets/img/dice_3.png'
import Die4 from '@/assets/img/dice_4.png'
import Die5 from '@/assets/img/dice_5.png'
import Die6 from '@/assets/img/dice_6.png'
import Image from 'next/image'
import useAudio from '@/hooks/useAudio'
import { generateCommitment } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { selectParticipantAddresses } from '@/features/games/gamesSlice'
import { dappAddress, dappRelayAddress, hasDeposited } from '@/lib/utils'
import { useConnectWallet, useSetChain } from '@web3-onboard/react'
import { addInput, sendEther, inspectCall } from '@/lib/cartesi'
import { useRollups } from '@/hooks/useRollups'
import Button from '../shared/Button'

const die = [Die1, Die2, Die3, Die4, Die5, Die6]

interface ApparatusProps {
  game: any
}


const Dice: FC<ApparatusProps> = ({ game }) => {

   const [{ connectedChain }] = useSetChain()
  const rollups = useRollups(dappAddress)
  const [{ wallet }] = useConnectWallet()
  const diceRollSound = useAudio('/sounds/diceRoll.mp3')
  const players = useSelector((state: any) =>
    selectParticipantAddresses(state.games)
  )

  const [rollCount, setRollCount] = useState<number>(0)
  const [delayedGame, setDelayedGame] = useState<any>(null)
  const [isRolling, setIsRolling] = useState<boolean>(false)
  const [result, setResult] = useState<number>(1)
  const [commitmentStatus, setCommitmentStatus] = useState<boolean>(false)
  const [revealMove, setRevealMove] = useState<boolean>(false)
  const [canRollDice, setCanRollDice] = useState<boolean>(false)

  const joinGame = async () => {

    

    if (wallet?.accounts[0].address) {

      const playerAddress = wallet.accounts[0].address

      if (game.gameSettings.bet) {
        const reports = await inspectCall(
          `balance/${playerAddress}/${game.id}`,
          connectedChain
        )
        const res = hasDeposited(
          playerAddress,
          game.id,
          game.gameSettings.bettingAmount,
          reports
        )

        if (!res) return toast.error(`You need to deposit ${game.gameSettings.bettingAmount} to join`)
      }

      const id = window.location.pathname.split('/').pop()
      if (!id) return toast.error('Game not found')


      const jsonPayload = JSON.stringify({
        method: 'addParticipant',
        data: { gameId: id, playerAddress },
      })

      await addInput(JSON.stringify(jsonPayload), dappAddress, rollups)
    }

    

  }

  const rollDice = async () => {
    try {
      const jsonPayload = JSON.stringify({
        method: 'rollDice',
        data: {
          gameId: game.id,
          playerAddress: game.activePlayer,
        },
      })

      if (game.activePlayer === wallet?.accounts[0].address) {
        const tx = await addInput(
          JSON.stringify(jsonPayload),
          dappAddress,
          rollups
        )

        const result = await tx.wait(1)
        console.log('tx for the game roll', result)
      }
    } catch (error) {
      console.error('Error during game roll:', error)
    }
  }

  const playGame = async (response: string) => {

    // if (!canRollDice) return toast.error('Wait for all players to move')

    const playerAddress = wallet?.accounts[0].address

    if (!playerAddress) return toast.error('Connect account')

    if (game.activePlayer !== wallet?.accounts[0].address) {
      return toast.error('Not your turn to play')
    }

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
          data: {
            gameId: game.id,
            playerAddress,
            response,
            commitment: await generateCommitment(playerAddress)
          },
        })

        const tx = await addInput(
          JSON.stringify(jsonPayload),
          dappAddress,
          rollups
        )

        const result = await tx.wait(1)
        console.log('tx for the game play ', result)
      } catch (error) {
        console.error('Error during game play: ', error)
      }
    } else {
      toast.error('Not enough players to play')
    }
  }


  const commit = async () => {
    const playerAddress = wallet?.accounts[0].address
    if (!playerAddress) return toast.error('Connect account')

    const jsonPayload = JSON.stringify({
      method: 'commit',
      gameId: game.id,
      commitment: await generateCommitment(playerAddress)
    })

    const tx = await addInput(JSON.stringify(jsonPayload), dappAddress, rollups)
    const res = await tx.wait(1)
    if (res) {
      // setCommitmentStatus(true) // Update commitment status
      toast.success('Move committed successfully!')
    }
  }

  const reveal = async () => {
    
    const playerAddress = wallet?.accounts[0].address
    const nonce = localStorage.getItem(`nonce${playerAddress}`)
    const move = localStorage.getItem(`move${playerAddress}`)

     const jsonPayload = JSON.stringify({
       method: 'reveal',
       gameId: game.id,
       move,
       nonce
     })

    await addInput(
      JSON.stringify(jsonPayload),
      dappAddress,
      rollups
    )
  }

  const transfer = async () => {
    console.log(wallet?.accounts[0].address.toUpperCase())
    console.log('0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65')

    const jsonPayload = JSON.stringify({
      method: 'transfer',
      // from: wallet?.accounts[0].address,
      from: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      ether: '0xFfdbe43d4c855BF7e0f105c400A50857f53AB044',
      amount: 1000000000000000000,
    })

    await addInput(JSON.stringify(jsonPayload), dappAddress, rollups)
  }

  const depositHandler = async () => {
    if (!game.gameSettings.bet) return toast.error('Not a betting game')

    await sendEther(dappAddress, game.id, game.bettingAmount, rollups)

  }

  const sendRelayAddress = async () => {
    if (rollups) {
      try {
        await rollups.relayContract.relayDAppAddress(dappRelayAddress)
        
      } catch (e) {
        console.log(`${e}`)
      }
    }
  }

  useEffect(() => {
    console.log('inside reveal useeffect')
    if (game && game.participants && game.participants.length > 0) {
      const allPlayersCommitted = game?.participants.every((participant: any) => {
        return participant.commitment
      })

      if (allPlayersCommitted) {
        toast.success('All set to reveal!')
        setRevealMove(true)
      }
    }
  }, [game?.participants.map((participant: any) => participant.commitment).join(',')])

  useEffect(() => {
     console.log('inside all moved useeffect')
    if (game && game.participants && game.participants.length > 0) {
      const allPlayersMoved = game?.participants.every((participant: any) => {
        return participant.move
      })

      if (allPlayersMoved) {
        toast.success('All set to roll!')
        setCanRollDice(true)
        setRevealMove(false)
      }
    }
  }, [game?.participants.map((participant: any) => participant.move).join(',')])



  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDelayedGame(game)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [game])

  // const currentGame = delayedGame || game

  useEffect(() => {
    setRollCount((prevCount) => prevCount + 1)
  }, [result])

  useEffect(() => {
    if (canRollDice) {
      rollDice()
    }
  }, [canRollDice])

  useEffect(() => {
    
    if (game?.rollOutcome && game?.rollOutcome !== 0) {
      console.log(game?.rollOutcome)
      setIsRolling(true)

      const interval = setInterval(() => {
        diceRollSound?.play()
        setResult(Math.floor(Math.random() * 6) + 1)
      }, 80)

      // Stop rolling after a certain time and show the final result
      setTimeout(() => {
        clearInterval(interval)
        
        setResult(game?.rollOutcome)
        setIsRolling(false)
        setCanRollDice(false)
      }, 4000)

      return () => clearInterval(interval)
    } else {
      setResult(1)
    }
  }, [game?.rollOutcome, game?.dateCreated, diceRollSound])


  return (
    <div className="flex flex-col">
      <button
        className={`hover:scale-105 active:scale-100 duration-300 md:w-auto w-[200px]`}
        onClick={() => playGame('yes')}
        disabled={isRolling}
      >
        {result !== null && (
          <Image
            src={die[result - 1]}
            alt={`Die ${result}`}
            className={`die ${rollCount}`}
          />
        )}
      </button>

      <div className="flex justify-center">
        {game &&
          game.status === 'New' &&
          game.gameSettings.bet &&
          wallet &&
          // game?.participants.some(
          //   (participant: any) =>
          //     participant.playerAddress === wallet.accounts[0].address &&
          //     !participant.deposited
          // ) &&
          !game.commitPhase &&
          !game.movePhase && (
            <div>
              <Button
                className="mt-6"
                style={{ background: '' }}
                onClick={depositHandler}
              >
                Deposit
              </Button>
            </div>
          )}
        {game &&
          game.status === 'In Progress' &&
          !game.commitPhase &&
          !game.movePhase && (
            <div>
              <Button
                className="mt-6"
                style={{ background: '' }}
                onClick={() => playGame('no')}
              >
                Pass
              </Button>
            </div>
          )}
        {game &&
          game.status === 'New' &&
          wallet &&
          !players.includes(wallet.accounts[0].address) && (
            <div>
              <Button onClick={joinGame} className="mb-10" type="button">
                Join Game
              </Button>
            </div>
          )}
        <Button
          onClick={commit}
          className={
            !wallet ||
            !players.includes(wallet.accounts[0].address) ||
            game?.activePlayer === wallet.accounts[0].address ||
            (game &&
              !game?.commitPhase &&
              game?.participants &&
              game?.participants.length) ||
            game?.participants.some(
              (participant: any) =>
                participant.playerAddress === wallet.accounts[0].address &&
                participant.commitment !== null
            )
              ? 'hidden'
              : ''
          }
        >
          Commit
        </Button>
        <Button
          onClick={reveal}
          className={revealMove ? '' : 'hidden'}
          disabled={!revealMove}
        >
          Reveal
        </Button>
      </div>
      {/* <Button onClick={sendRelayAddress}>Set Relay Address</Button> */}
      <Button onClick={transfer}>Transfer</Button>
    </div>
  )
}

export default Dice
