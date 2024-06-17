import { FC, useEffect, useRef, useState } from 'react'
import Die1 from '@/assets/img/dice_1.png'
import Die2 from '@/assets/img/dice_2.png'
import Die3 from '@/assets/img/dice_3.png'
import Die4 from '@/assets/img/dice_4.png'
import Die5 from '@/assets/img/dice_5.png'
import Die6 from '@/assets/img/dice_6.png'
import Image from 'next/image'
import useAudio from '@/hooks/useAudio'
import { generateCommitment, erc20Token, getPlayerVouchers } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { selectParticipantAddresses } from '@/features/games/gamesSlice'
import { dappAddress, dappRelayAddress, hasDeposited } from '@/lib/utils'
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import { addInput, sendEther, inspectCall, depositErc20 } from '@/lib/cartesi'
import { useRollups } from '@/hooks/useRollups'
import Button from '../shared/Button'
import { BigNumber, ethers } from 'ethers'
import { api } from '@/convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import { action } from '@/convex/_generated/server'
import { VoucherService } from '@/lib/cartesi/vouchers'
import ClaimModal from './ClaimModal'


const die = [Die1, Die2, Die3, Die4, Die5, Die6]

interface ApparatusProps {
  game: any
}

const Dice: FC<ApparatusProps> = ({ game }) => {

  // const voucherService = new VoucherService()

  // const [result, reexecuteQuery] = useVouchersQuery()
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
  const [pass, setPass] = useState<boolean>(false)
  const [claimModal, setClaimModal] = useState<boolean>(false)
  const [gameEnded, setGameEnded] = useState<boolean>(false)
  const previousRollCount = useRef<string | null>(null)

  const checkBalance = async () => {
    const playerAddress = wallet?.accounts[0].address
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
      // ? toast('Successfully deposited. You can join game!')
      // : toast(`Deposit ${game.bettingAmount} to join game`)
  }

  const joinGame = async () => {

    if (!wallet?.accounts[0].address) return toast.error('Connect account')

      const playerAddress = wallet.accounts[0].address.toLowerCase()


      // check if player has deposited

      if (game?.gameSettings.bet) {
        const reports = await inspectCall(
          `balance/${playerAddress}`,
          connectedChain
        )
   
        const res = hasDeposited(game.bettingAmount, reports[0])

        if (!res) return toast.error(`You need to deposit ${game.bettingAmount} ether to join`)
        
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
          data: {
            gameId: id,
            playerAddress,
            amount: game.bettingAmount
          },
          ...(game.gameSettings.bet && {
            args: {
              from: wallet?.accounts[0].address,
              to: dappAddress,
              erc20: erc20Token,
              amount: game.bettingAmount
            }
          })
        })
  
        const tx = await addInput(jsonPayload, dappAddress, rollups)
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
          jsonPayload,
          dappAddress,
          rollups
        )

        const result = await tx.wait(1)
        // reset()
        console.log('tx for the game roll', result)
      }
    } catch (error) {
      console.error('Error during game roll:', error)
      rollDice()
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

    if (game.gameSettings.bet && !deposited) {
      return toast.error(`Deposit ${game.bettingAmount} to continue`)
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
          jsonPayload,
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
          jsonPayload,
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
      const tx = await addInput(jsonPayload, dappAddress, rollups)
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
       jsonPayload,
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


  const transfer = async (action = '') => {

        try {
          
          const jsonPayload = JSON.stringify({
            method: 'erc20_transfer',
            gameId: game.id,
            action,
            args: {
              from: dappAddress,
              to: wallet?.accounts[0].address,
              erc20: erc20Token,
              amount: 4
              // amount: ethers.utils.parseEther(game.bettingAmount.toString())
            }
          })

          const tx = await addInput(
            jsonPayload,
            dappAddress,
            rollups
          )
          const res = await tx.wait(1)
          console.log('transfer ', res)

      
        } catch (error) {
          console.log(error)
          setDepositing(false)
        }
  }

  const withdraw = async () => {

    try {
      const jsonPayload = JSON.stringify({
        method: 'erc20_withdraw',
        gameId: game.id,
        action: null,
        args: {
          account: wallet?.accounts[0].address,
          erc20: erc20Token,
          amount: 4
        }
      })

      const tx = await addInput(jsonPayload, dappAddress, rollups)
      const res = await tx.wait(1)
      // if (res) {
      //   const vouchers = await voucherService.getVouchers()
      //   if (vouchers.length && wallet?.accounts[0].address) {
      //     const playerVouchers = getPlayerVouchers(wallet?.accounts[0].address, vouchers)
      //     console.log('playerVouchers ', playerVouchers)
      //   }
      // }
      console.log('withdraw ', res)
    } catch (error) {
      console.log(error)
      setDepositing(false)
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

  const sendRelayAddress = async () => {
    if (rollups) {
      try {
      toast.success('Set Dapp address')
       const tx = await rollups.relayContract.relayDAppAddress(dappAddress) 
       if (tx) {
        const res = await tx.wait(1)
        if (res) {
          toast.success('Transfering to winner')
          transfer()
        }
       }
      } catch (e) {
        console.log(`${e}`)
      }
    }
  }

  const handleCloseModal = () => {
    setClaimModal(false)
  }

  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (wallet?.accounts[0].address) {
  //       const vouchers = await voucherService.getVouchers()
  //       if (vouchers.length) {
  //         const playerVouchers = getPlayerVouchers(
  //           wallet?.accounts[0].address,
  //           vouchers
  //         )
  //         console.log('playerVouchers ', playerVouchers)
  //       }
  //     }
  //   }

  //   fetchData()
  // }, [wallet?.accounts[0].address])


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
      if (wallet?.accounts[0].address && game?.gameSettings.bet) {
        const participant = game?.participants.find(
          (participant: any) =>
            participant.address === wallet?.accounts[0].address
        )
        const hasDeposited = participant?.deposited
        setDeposited(hasDeposited)
      }
    }

    if (wallet?.accounts[0].address && game?.gameSettings.bet) {
      checkDeposit()
    }
  }, [wallet?.accounts[0].address, game?.gameSettings.bet])


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
     if (game?.status === 'Ended' && !gameEnded) {
      setGameEnded(true)
      // if (game.winner === wallet?.accounts[0].address){
      //   sendRelayAddress()
      // } 
     }
   }, [game?.status, game?.winner, gameEnded])

   
useEffect(() => {
  if (userJoining === null || userPlaying === null) {
    creatUserAction()
  }
}, [userJoining, userPlaying])

  return (
    <div className="flex flex-col justify-center">
      <ClaimModal claimModal={claimModal} onClose={handleCloseModal} />
      <button onClick={sendRelayAddress}>Set DappAddress</button>
      <button onClick={checkBalance}>Check balance</button>
      <button onClick={() => transfer()}>Transfer</button>
      {userJoining &&
        game?.participants.some(
          (participant: any) =>
            participant.address === wallet?.accounts[0].address
        ) && <p className="text-center mb-2">Player joining ...</p>}
      {userPlaying && <p className="text-center mb-2">Initiating game ...</p>}
      {game?.status === 'Ended' &&
        game?.participants.some(
          (participant: any) =>
            participant.address == wallet?.accounts[0].address &&
            participant.fundTransfered === false
        ) &&
        game?.winner == wallet?.accounts[0].address && (
          <Button onClick={withdraw}>Withdraw</Button>
        )}
      {game?.status === 'Ended' &&
        game?.participants.some(
          (participant: any) =>
            participant.address == wallet?.accounts[0].address &&
            participant.fundTransfered === true &&
            participant.fundClaimed === false
        ) &&
        game?.winner == wallet?.accounts[0].address && (
          <Button onClick={() => setClaimModal(true)}>Claim</Button>
        )}
      <Button onClick={() => setClaimModal(true)}>Claim</Button>
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
              <Button
                disabled={depositing}
                className="my-6 w-[200px]"
                onClick={depositErc20Handler}
              >
                {depositing ? 'Depositing ...' : 'Deposit'}
              </Button>
            </div>
          )}
        {/* {gameEnded && (
          <Button className="my-6" onClick={transfer}>
            Transfer
          </Button>
        )} */}
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
    </div>
  )
}

export default Dice

// {"method": "erc20_transfer",
// "args": {
//   "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
// "to": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
// "erc20": "0x92c6bca388e99d6b304f1af3c3cd749ff0b591e2",
// "amount": 1
// }
// }

// {"method": "erc20_transfer", "args": {   "from": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", "to": "0x0", "erc20": "0x92c6bca388e99d6b304f1af3c3cd749ff0b591e2", "amount": 2 } }