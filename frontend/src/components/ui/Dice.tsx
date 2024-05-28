import { FC, useEffect, useRef, useState } from 'react'
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
import { ethers } from 'ethers'
import { api } from '@/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import { Id } from '@/convex/_generated/dataModel'

const die = [Die1, Die2, Die3, Die4, Die5, Die6]

interface ApparatusProps {
  game: any
}


const Dice: FC<ApparatusProps> = ({ game }) => {

  const updateUserAction = useMutation(api.game.updateGame)
  const userJoining = useQuery(api.game.getUserJoining)
  const userPlaying = useQuery(api.game.getUserPlaying)
  const [{ connectedChain }] = useSetChain()
  const rollups = useRollups(dappAddress)
  const [{ wallet }] = useConnectWallet()
  const diceRollSound = useAudio('/sounds/diceRoll.mp3')
  const players = useSelector((state: any) =>
    selectParticipantAddresses(state.games)
  )

  const [rollCount, setRollCount] = useState<number>(0)
  const [isRolling, setIsRolling] = useState<boolean>(false)
  const [result, setResult] = useState<number>(1)
  const [revealMove, setRevealMove] = useState<boolean>(false)
  const [revealing, setRevealing] = useState<boolean>(false)
  const [commiting, setCommiting] = useState<boolean>(false)
  const [committed, setCommitted] = useState<boolean>(false)
  const [revealed, setRevealed] = useState<boolean>(false)
  const [canRollDice, setCanRollDice] = useState<boolean>(false)
  const [deposited, setDeposited] = useState<boolean>(false)
  const [joining, setJoining] = useState<boolean>(false)
  const [pass, setPass] = useState<boolean>(false)
  const [gameEnded, setGameEnded] = useState<boolean>(false)
  const previousRollCount = useRef<string | null>(null)

  const test = async () => {
    const playerAddress = wallet?.accounts[0].address
    const reports = await inspectCall(
      `balance/${playerAddress}`,
      connectedChain
    )
    console.log(reports)
  }

  const joinGame = async () => {

    if (!wallet?.accounts[0].address) return toast.error('Connect account')

      const playerAddress = wallet.accounts[0].address


      // check if player has deposited

      if (game?.gameSettings.bet) {
        const reports = await inspectCall(
          `balance/${playerAddress}`,
          connectedChain
        )
   
        const res = hasDeposited(game.bettingAmount, reports)

        // if (!res) return toast.error(`You need to deposit ${game.bettingAmount} ether to join`)
        
        setDeposited(true)
      }

      const id = window.location.pathname.split('/').pop()
      if (!id) return toast.error('Game not found')

      setJoining(true)
      updateUserAction({
        data: { userJoining: true }
      })

      try {
        const jsonPayload = JSON.stringify({
          method: 'addParticipant',
          data: { gameId: id, playerAddress },
        })
  
        const tx = await addInput(JSON.stringify(jsonPayload), dappAddress, rollups)
        const result = await tx.wait(1)

        if (result) {
          setJoining(false)
          updateUserAction({
            data: { userJoining: false }
          })
        } else {
          updateUserAction({
            data: { userJoining: false }
          })
        }
      } catch (error) {
        console.error('Error during game join:', error)
        setJoining(false)
        updateUserAction({
          data: { userJoining: false }
        })
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
        // reset()
        console.log('tx for the game roll', result)
      }
    } catch (error) {
      console.error('Error during game roll:', error)
    }
  }

  const playGame = async (response: string) => {

    if (gameEnded || game.status === 'Ended') {
      return toast.error('Game has ended')
    }

    if (game.commitPhase || game.revealPhase) {
      return toast.error('Can\'t play game now')
    }

    const playerAddress = wallet?.accounts[0].address

    if (!playerAddress) return toast.error('Connect account')
    if (players.length < 2) return toast.error('Not enough players to start')

    if (game.activePlayer !== playerAddress) {
      return toast.error('Not your turn')
    }

    if (response === 'yes') {

      updateUserAction({
        data: { userPlaying: true }
      })

      try {
        setCommiting(true)
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
        if (result) {
          setCommitted(true)
          setCommiting(false)
          updateUserAction({
            data: { userPlaying: false }
          })
        }
        console.log('tx for the game play ', result)
      } catch (error) {
        setCommiting(false)
        updateUserAction({
          data: { userPlaying: false }
        })
        console.error('Error during game play: ', error)
      }
    } else {
      try {

        setPass(true)

        updateUserAction({
          data: { userPlaying: true }
        })

        const jsonPayload = JSON.stringify({
          method: 'playGame',
          data: {
            gameId: game.id,
            playerAddress,
            response
          },
        })

        const tx = await addInput(
          JSON.stringify(jsonPayload),
          dappAddress,
          rollups
        )

        const result = await tx.wait(1)
        if (result) {
          updateUserAction({
            data: { userPlaying: false }
          })
          setPass(false)
        }
        console.log('tx for the game play ', result)
      } catch (error) {
        setPass(false)
        updateUserAction({
          data: { userPlaying: false }
        })
        console.error('Error during game play: ', error)
      }
    }
  }


  const commit = async () => {
    const playerAddress = wallet?.accounts[0].address
    if (!playerAddress) return toast.error('Connect account')

    // Ensure user has not commited before
    const currentPlayer = game?.participants.find(
      (participant: any) => participant.address === playerAddress)

    if (currentPlayer.commitment) return toast.error('Already commited')

    if (game?.activePlayer === playerAddress) return playGame('yes')

    try {

      updateUserAction({
        data: { userPlaying: true }
      })

      const jsonPayload = JSON.stringify({
        method: 'commit',
        gameId: game.id,
        commitment: await generateCommitment(playerAddress)
      })
  
      setCommiting(true)
      const tx = await addInput(JSON.stringify(jsonPayload), dappAddress, rollups)
      const res = await tx.wait(1)
  
      if (res) {

        updateUserAction({
          data: { userPlaying: false }
        })

        setCommiting(false)
        setCommitted(true)
        toast.success('Move committed successfully!')
      }
    } catch (error) {
      console.log('error while commiting ', error)
      setCommiting(false)
      updateUserAction({
        data: { userPlaying: false }
      })
    }
  }

  const reveal = async () => {

    const playerAddress = wallet?.accounts[0].address

    if (playerAddress && !players.includes(playerAddress)) return toast.error('You are not a player')

      const currentPlayer = game?.participants.find(
        (participant: any) => participant.address === playerAddress
      )

    if (currentPlayer?.move) return toast.error('Already revealed')

    updateUserAction({
      data: { userPlaying: true }
    })
    
    setRevealing(true)

    const nonce = localStorage.getItem(`nonce${playerAddress}`)
    const move = localStorage.getItem(`move${playerAddress}`)

     const jsonPayload = JSON.stringify({
       method: 'reveal',
       gameId: game.id,
       move,
       nonce
     })

   try {
     const tx = await addInput(
       JSON.stringify(jsonPayload),
       dappAddress,
       rollups
     )
 
     const res = await tx.wait(1)
     if (res) {

      updateUserAction({
        data: { userPlaying: false }
      })

       setRevealing(false)
       setRevealed(true)
       toast.success('Move revealed successfully!')
     }
   } catch (error) {
     setRevealing(false)

     updateUserAction({
       data: { userPlaying: false }
     })
   }

  }


  const transfer = async () => {

     const jsonPayload = JSON.stringify({
      method: 'withdraw',
      args: {
        amount: ethers.utils.parseEther(String(game.bettingAmount))
      }
    })

    // const jsonPayload = JSON.stringify({
    //   method: 'transfer',
    //   gameId: game.id
    // })

    await addInput(JSON.stringify(jsonPayload), dappAddress, rollups)
  }

  const depositHandler = async () => {
    if (!game?.gameSettings.bet) return toast.error('Not a betting game')

    try {
      await sendEther(dappAddress, game.id, game.bettingAmount, rollups)
      setDeposited(true)
      setTimeout(joinGame, 7000)
  
    } catch (error) {
      console.log(error)
    }

  }

  const sendRelayAddress = async () => {
    if (rollups) {
      try {
        await rollups.relayContract.relayDAppAddress(dappAddress)
        
      } catch (e) {
        console.log(`${e}`)
      }
    }
  }

  useEffect(() => {

    if (
      game &&
      game.status !== 'Ended' &&
      game.participants &&
      game.participants.length > 0
    ) {
      const allPlayersCommitted = game?.participants.every(
        (participant: any) => {
          return participant.commitment
        }
      )

      if (allPlayersCommitted) {
        toast.success('All set to reveal!')
        setRevealMove(true)
      }
    }
  }, [game?.participants.map((participant: any) => participant.commitment).join(',')])

  useEffect(() => {

    if (game && game.status !== 'Ended' && game.participants && game.participants.length > 0) {
      const allPlayersMoved = game?.participants.every((participant: any) => {
        return participant.move
      })

      if (allPlayersMoved) {
        toast.success('Dice set to roll!')
        // setForceTrigger(true)
        setCanRollDice(true)
        setRevealMove(false)
      }
    }
  }, [game?.participants.map((participant: any) => participant.move).join(',')])


  useEffect(() => {
    setRollCount((prevCount) => prevCount + 1)
  }, [result])

  useEffect(() => {
    const checkDeposit = async () => {
      if (wallet?.accounts[0].address && game?.gameSettings.bet) {
        const playerAddress = wallet.accounts[0].address
        const reports = await inspectCall(
          `balance/${playerAddress}`,
          connectedChain
        )

        const hasUserDeposited = hasDeposited(game.bettingAmount, reports)
        setDeposited(hasUserDeposited)
      }
    }

    checkDeposit()
  }, [wallet, game?.gameSettings.bet, connectedChain])

  useEffect(() => {
    if (canRollDice) {
      setCommitted(false)
      setRevealed(false)
      rollDice()
    }
  }, [canRollDice])

 
  useEffect(() => {
    if (game?.rollOutcome && game?.rollOutcome !== 0 && game?.rollCount) {
      if (game.rollCount !== previousRollCount.current) {
        console.log(game?.rollOutcome)
        previousRollCount.current = game.rollCount
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
          setCommitted(false)
          setRevealed(false)
        }, 4000)

        return () => clearInterval(interval)
      }
    } else {
      setResult(1)
      setCommitted(false)
      setRevealed(false)
    }
  }, [game?.rollOutcome, diceRollSound, game?.rollCount])

   useEffect(() => {
     if (game?.status === 'Ended') {
      setGameEnded(true)
     }
   }, [game?.status, game?.winner])


  return (
    <div className="flex flex-col justify-center">
      {userJoining &&
        game?.participants.some(
          (participant: any) =>
            participant.address === wallet?.accounts[0].address
        ) && <p className="text-center mb-2">Player joining ...</p>}
      {userPlaying &&
        <p className="text-center mb-2">Initiating game ...</p>}
      <button
        className={`hover:scale-105 active:scale-100 duration-300 md:w-auto w-[200px]`}
        onClick={() => playGame('yes')}
        disabled={isRolling || commiting}
      >
        {result !== null && (
          <Image
            src={die[result - 1]}
            alt={`Die ${result}`}
            className={`die ${rollCount}`}
          />
        )}
      </button>

      <div className="flex flex-col justify-center">
        {game &&
          game.status === 'New' &&
          game.gameSettings.bet &&
          wallet &&
          !deposited &&
          !game.commitPhase &&
          !game.revealPhase && (
            <div className="flex justify-center">
              <Button className="my-6" onClick={depositHandler}>
                Deposit
              </Button>
            </div>
          )}
        {/* <Button className="my-6" onClick={depositHandler}>
          Deposit
        </Button> */}
        {game &&
          game.status === 'In Progress' &&
          game?.activePlayer === wallet?.accounts[0].address &&
          !canRollDice && (
            <div className="flex justify-center">
              <Button
                disabled={
                  isRolling ||
                  commiting ||
                  revealing ||
                  gameEnded ||
                  revealMove ||
                  game?.revealPhase ||
                  game?.commitPhase
                }
                className={`mt-6 w-[200px] ${
                  game?.commitPhase || game?.revealPhase || revealMove
                    ? 'hidden'
                    : ''
                } `}
                onClick={() => playGame('no')}
              >
                {commiting ? 'Commiting ...' : pass ? 'Passing ...' : 'Pass'}
              </Button>
            </div>
          )}

        {game &&
          game.status === 'New' &&
          game.creator !== wallet?.accounts[0].address && (
            <div className="flex justify-center">
              <Button
                onClick={joinGame}
                disabled={
                  joining ||
                  game?.participants.some(
                    (participant: any) =>
                      participant.address === wallet?.accounts[0].address
                  )
                }
                className="mb-10"
                type="button"
              >
                {joining
                  ? 'Joining...'
                  : commiting
                  ? 'Committing...'
                  : game?.participants.some(
                      (participant: any) =>
                        participant.address === wallet?.accounts[0].address
                    )
                  ? 'Joined'
                  : 'Join Game'}
              </Button>
            </div>
          )}
        {/* <span onClick={test}>Test</span> */}
        <div className="flex justify-center">
          <Button
            onClick={commit}
            disabled={
              committed ||
              commiting ||
              !wallet ||
              !players.includes(wallet.accounts[0].address)
            }
            className={`w-[200px] ${
              !game?.commitPhase || revealMove ? 'hidden' : ''
            } `}
          >
            {commiting
              ? 'Committing...'
              : committed ||
                game?.participants.some(
                  (participant: any) =>
                    participant.address === wallet?.accounts[0].address &&
                    participant.commitment !== null
                )
              ? 'Committed'
              : 'Commit'}
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={reveal}
            className={`w-[200px] ${revealMove ? '' : 'hidden'}`}
            disabled={revealing || revealed}
          >
            {revealing
              ? 'Revealing ....'
              : revealed ||
                game?.participants.some(
                  (participant: any) =>
                    participant.address === wallet?.accounts[0].address &&
                    participant.move !== null
                )
              ? 'Revealed'
              : 'Reveal'}
          </Button>
        </div>
      </div>
      {/* <Button onClick={sendRelayAddress}>Set Relay Address</Button>
      <Button onClick={transfer}>Transfer</Button> */}
    </div>
  )
}

export default Dice
// screen fence prize absurd acoustic sure view parade moment car bitter sick