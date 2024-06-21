import { FC, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import useAudio from '@/hooks/useAudio'
import { generateCommitment, erc20Token, loadDiceImages, joinGame, playGame, rollDice, commit, reveal } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { selectParticipantAddresses } from '@/features/games/gamesSlice'
import { dappAddress, hasDeposited } from '@/lib/utils'
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import { addInput, inspectCall, depositErc20 } from '@/lib/cartesi'
import { useRollups } from '@/hooks/useRollups'
import Button from '../shared/Button'
import { ethers } from 'ethers'
import { api } from '@/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import WithdrawModal from '@/components/ui/WithdrawModal'

const die = loadDiceImages()

interface ApparatusProps {
  game: any
}

const Dice: FC<ApparatusProps> = ({ game }) => {

  const updateUserAction = useMutation(api.game.updateGame)
  const creatUserAction = useMutation(api.game.createGame)
  const userJoining = useQuery(api.game.getUserJoining)
  const userPlaying = useQuery(api.game.getUserPlaying)
  const [{ connectedChain }] = useSetChain()
  const rollups = useRollups(dappAddress)
  const [{ wallet }] = useConnectWallet()
  const diceRollSound = useAudio('/sounds/diceRoll.mp3')
  const players = useSelector((state: any) =>
    selectParticipantAddresses(state.games)
  )
  const [connectedWallet] = useWallets();
  const provider = connectedWallet ? new ethers.providers.Web3Provider(connectedWallet.provider) : null;

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
  const [depositing, setDepositing] = useState<boolean>(false)
  const [joining, setJoining] = useState<boolean>(false)
  const [claiming, setClaiming] = useState<boolean>(false)
  const [pass, setPass] = useState<boolean>(false)
  const [withdrawModal, setWithdrawModal] = useState<boolean>(false)
  const [gameEnded, setGameEnded] = useState<boolean>(false)
  const [paidOut, setPaidOut] = useState<boolean>(false)
  const [fundClaimed, setFundClaimed] = useState<boolean>(false)
  const previousRollCount = useRef<string | null>(null)

  const playerAddress = wallet?.accounts[0]?.address.toLowerCase()

  const checkBalance = async () => {

    const reports = await inspectCall(
      `balance/${playerAddress}`,
      connectedChain
    )
    console.log('balance for: ' + playerAddress, reports)
    const res = hasDeposited(game.bettingAmount, reports[0])
    
    if (res) {
      toast('Successfully deposited. You can join game!')
      return true
    } else {
      toast(`Deposit ${game.bettingAmount} to join game`)
      return false
    }
  }

  const joinGameHandler = async () => {
    if (!playerAddress) return toast('Connect account')

    await joinGame(
      wallet,
      game,
      playerAddress,
      updateUserAction,
      setDeposited,
      setJoining,
      connectedChain,
      rollups
    )
  }


  const rollDiceHandler = async () => {
    if (!playerAddress) return toast('Connect account')
    await rollDice(game, playerAddress, addInput, rollups)
  }

  const playGameHandler = async (response: string) => {
    if (!playerAddress) return toast('Connect account')

      playGame(
        response,
        game,
        playerAddress,
        players,
        deposited,
        rollups,
        updateUserAction,
        setCommiting,
        setCommitted,
        setPass
      )
    }

  const commitHandler = async () => {
    if (!playerAddress) return toast('Connect account')
    await commit(
      playerAddress,
      players,
      game,
      generateCommitment,
      addInput,
      rollups,
      updateUserAction,
      setCommiting,
      setCommitted,
      setPass
    )
  }

  const revealHandler = async () => {
    if (!playerAddress) return toast('Connect account')

    await reveal(playerAddress,
      game,
      players,
      addInput,
      rollups,
      updateUserAction,
      setRevealing,
      setRevealed)
    }

  const claim = async () => {
    setClaiming(true)

    try {
      const jsonPayload = JSON.stringify({
        method: 'erc20_withdraw',
        gameId: game.id,
        action: 'withdraw',
        args: {
          account: playerAddress,
          erc20: erc20Token,
          amount: Number(
            ethers.utils.parseUnits(game.bettingFund.toString(), 18)
          )
        }
      })

      const tx = await addInput(jsonPayload, dappAddress, rollups)
      const res = await tx.wait(1)

      
      if (res) {
        toast.success('Fund successfully claimed')
        setPaidOut(true)
        setClaiming(false)
        setFundClaimed(true)
      }
      console.log('claim response', res)
    } catch (error) {
      toast('Something went wrong. Try again')
      console.log(error)
      setClaiming(false)
    }
  }

  const depositErc20Handler = async () => {
    if (!game?.gameSettings.bet) return toast.error('Not a betting game')

    setDepositing(true)
    try {
      
      const tx = await depositErc20(erc20Token, game.bettingAmount, rollups, provider)
  
      const res = await tx.wait(1)
      if (res) {
        const result = await checkBalance()
        if (result) {
          setDepositing(false)
          setDeposited(true)
          toast.success('Deposit successful')
        }
      } else {
        setDepositing(false)
        toast.error('Deposit not successful')
      }
     
  
    } catch (error) {
      console.log(error)
      setDepositing(false)
    }

  }

  const withdrawModalHandler = () => {
    setWithdrawModal(true)
  }

  const handleCloseModal = () => {
    setWithdrawModal(false)
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
      if (playerAddress && game?.gameSettings.bet) {
        const participant = game?.participants.find(
          (participant: any) =>
            participant.address === playerAddress
        )
        const hasDeposited = participant?.deposited
        setDeposited(hasDeposited)
      }
    }

    if (playerAddress && game?.gameSettings.bet) {
      checkDeposit()
    }
  }, [playerAddress, game?.gameSettings.bet])


  useEffect(() => {
    if (canRollDice) {
      setCommitted(false)
      setRevealed(false)
      rollDiceHandler()
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
  if (
    game?.status === 'Ended' &&
    game.fundTransfered &&
    game.paidOut === false &&
    game?.winner == playerAddress
  ) {
    setTimeout(() => {
      setGameEnded(true)
    }, 5000)
  }
}, [game?.status, game?.winner, gameEnded])
   
useEffect(() => {
  if (userJoining === null || userPlaying === null) {
    creatUserAction()
  }
}, [userJoining, userPlaying])

  return (
    <div className="flex flex-col justify-center">
      <WithdrawModal withdrawModal={withdrawModal} onClose={handleCloseModal} />
      {userJoining &&
        game?.participants.some(
          (participant: any) => participant.address === playerAddress
        ) && <p className="text-center mb-2">Player joining ...</p>}

      {userPlaying && <p className="text-center mb-2">Initiating game ...</p>}

      {gameEnded &&  !game.paidOut && (
        <div className="flex justify-center mb-6">
          <Button disabled={claiming} onClick={claim}>
            {claiming ? 'Claiming ...' : 'Claim'}
          </Button>
        </div>
      )}

      {/*game?.status === 'Ended' &&
        game.fundTransfered &&
        game.paidOut === false &&
        game?.winner == playerAddress && (
          <div className="flex justify-center mb-6">
            <Button disabled={claiming} onClick={claim}>
              {claiming ? 'Claiming ...' : 'Claim'}
            </Button>
          </div>
        )*/}

      {game?.status === 'Ended' &&
        (fundClaimed || paidOut || game.paidOut) &&
        game?.winner == playerAddress && (
          <div className="flex justify-center mb-6">
            <Button onClick={withdrawModalHandler}>{'Withdraw'}</Button>
          </div>
        )}
      <button
        className={`hover:scale-105 active:scale-100 duration-300 md:w-auto w-[200px]`}
        onClick={() => playGameHandler('yes')}
        disabled={
          isRolling ||
          commiting ||
          revealing ||
          depositing ||
          game?.lockApparatus
        }
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
              <Button
                disabled={depositing}
                className="my-6 w-[200px]"
                onClick={depositErc20Handler}
              >
                {depositing ? 'Depositing ...' : 'Deposit'}
              </Button>
            </div>
          )}

        {game &&
          game.status === 'In Progress' &&
          game?.activePlayer === playerAddress &&
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
                className={`mt-6 w-[180px] ${
                  game?.commitPhase || game?.revealPhase || revealMove
                    ? 'hidden'
                    : ''
                } `}
                onClick={() => playGameHandler('no')}
              >
                {commiting ? 'Commiting ...' : pass ? 'Passing ...' : 'Pass'}
              </Button>
            </div>
          )}

        {game && game.status === 'New' && game.creator !== playerAddress && (
          <div className="flex justify-center">
            <Button
              onClick={joinGameHandler}
              disabled={
                joining ||
                depositing ||
                game?.participants.some(
                  (participant: any) => participant.address === playerAddress
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
                    (participant: any) => participant.address === playerAddress
                  )
                ? 'Joined'
                : 'Join Game'}
            </Button>
          </div>
        )}

        {playerAddress && (
          <div className="flex justify-center">
            <Button
              onClick={commitHandler}
              disabled={
                committed ||
                commiting ||
                !wallet ||
                !players.includes(playerAddress)
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
        )}

        <div className="flex justify-center">
          <Button
            onClick={revealHandler}
            className={`w-[200px] ${revealMove ? '' : 'hidden'}`}
            disabled={revealing || revealed}
          >
            {revealing
              ? 'Revealing ....'
              : revealed ||
                game?.participants.some(
                  (participant: any) =>
                    participant.address === playerAddress &&
                    participant.move !== null
                )
              ? 'Revealed'
              : 'Reveal'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Dice