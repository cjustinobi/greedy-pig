import { FormEvent, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectGameModal } from '@/features/modal/modalSlice'
import Button from '../shared/Button'
import toast from 'react-hot-toast'
import { GameStatus } from '@/interfaces'
import { addInput, depositErc20, inspectCall } from '@/lib/cartesi'
import { useRollups } from '@/hooks/useRollups'
import { dappAddress, erc20Token, hasDeposited } from '@/lib/utils'
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import { useNotices } from '@/hooks/useNotices'
import { parseEther, parseUnits } from 'ethers/lib/utils'
import { BigNumber, ethers } from 'ethers'

const CreateGameModal = () => {

  const [{ connectedChain }] = useSetChain()
  const [connectedWallet] = useWallets()
  const [{ wallet }] = useConnectWallet()
  const { refetch } = useNotices()
  const dispatch = useDispatch()
  const createGameForm = useSelector((state: any) =>
    selectGameModal(state.modal)
  )
  const rollups = useRollups(dappAddress)
  const provider = connectedWallet
    ? new ethers.providers.Web3Provider(connectedWallet.provider)
    : null

  const [creator, setCreator] = useState<string | undefined>('')
  const [gameName, setGameName] = useState<string>('')
  const [winningScore, setWinningScore] = useState<number>(20)
  const [bettingAmount, setBettingAmoun] = useState<any>('0.02')
  const [bet, setBet] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [depositing, setDepositing] = useState<boolean>(false)
  const [hasUserDeposited, setHasUserDeposited] = useState<boolean | null>(null)

  const game = {
    creator,
    activePlayer: '',
    gameName,
    commitPhase: false,
    revealPhase: false,
    participants: [],
    gameSettings: {
      numbersOfTurn: 2,
      winningScore: winningScore,
      mode: 'score',
      apparatus: 'dice',
      bet: false,
      maxPlayer: 10,
      limitNumberOfPlayer: true,
    },
    status: GameStatus.New,
    rollOutcome: 0,
    rollCount: 0,
    winner: '',
    bettingAmount, // in ether
    bettingFund: 0, // total fund transfered by players
    paidOut: false
  }

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (bet) {
      const reports = await inspectCall(`balance/${creator}`, connectedChain)

      setHasUserDeposited(hasDeposited(bettingAmount, reports[0]))
     
      if (!hasUserDeposited)
        return toast.error(
          `Deposit ${game.bettingAmount} CTSI to create and join the game`
        )
    }

    


    setLoading(true)
    try {
      setLoading(true)
      await createGameHandler()
      reset()
      setLoading(false)
      toast.success('Game created successfully')
    } catch (error) {
      console.log('send game error: ', error)
      setLoading(false)
    }
  }

  const createGameHandler = async () => {
    game.gameName = gameName
    game.gameSettings.winningScore = winningScore
    game.gameSettings.bet = bet
    game.bettingAmount = bettingAmount

    const jsonPayload = JSON.stringify({
      method: 'createGame',
      data: game,
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
      console.log('result: ', result)
      refetch()
    }
  }

  const handleOptionChange = (value: boolean) => {
    setBet(value)
  }

  const reset = () => {
    setGameName('')
    dispatch({ type: 'modal/toggleGameModal' })
  }

   const depositErc20Handler = async () => {
     if (!bet) return toast.error('Not a betting game')

     setDepositing(true)
     try {
       const tx = await depositErc20(
         erc20Token,
         bettingAmount,
         rollups,
         provider
       )

       const res = await tx.wait(1)
       if (res) {
         const result = await checkBalance()
         if (result) {
           setDepositing(false)
           setHasUserDeposited(true)
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

    const checkBalance = async () => {
   
      const reports = await inspectCall(
        `balance/${creator}`,
        connectedChain
      )
      console.log('balance for: ' + creator, reports)
      const res = hasDeposited(bettingAmount, reports[0])

      if (res) {
        toast('Successfully deposited. You can continue creating game!')
        return true
      } else {
        toast(`Deposit ${bettingAmount} to join game`)
        return false
      }
    }

  useEffect(() => {
    const init = async () => {
      const { Modal, Ripple, initTE } = await import('tw-elements')
      initTE({ Modal, Ripple })
    }
    init()
  }, [])

  useEffect(() => {
    setCreator(wallet?.accounts[0].address)
  }, [wallet])

  return (
    <div
      className={`fixed ${
        createGameForm ? '' : 'hidden'
      } inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal`}
    >
      <form
        className="mx-auto mt-10 w-[38rem] p-5 bg-gray-700 rounded-lg relative"
        onSubmit={submitHandler}
      >
        <button
          onClick={reset}
          type="button"
          className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none absolute right-6 z-50"
          data-te-modal-dismiss
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="my-4">
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Title
          </label>
          <input
            required
            onChange={(e) => setGameName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="Ohio Meet & Greet Game"
          />
        </div>

        <div className="my-4">
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="winningScore"
          >
            Winning Score
          </label>
          <input
            onChange={(e) => setWinningScore(parseInt(e.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="winningScore"
            type="number"
            min={3}
            placeholder="Set Winning Score"
          />
        </div>

        {/* <div className="my-4">
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="startDate"
          >
            Start Time
          </label>
          <input
            onChange={(e) => setStartTime(e.target.value)}
            type="datetime-local"
            className="appearance-none bg-gray-100 border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div> */}

        <div className="mb-4">
          <span className="block">Stake Game?</span>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="accountType"
              onChange={() => handleOptionChange(true)}
            />
            <span className="ml-2">Yes</span>
          </label>
          <label className="inline-flex items-center ml-6">
            <input
              type="radio"
              className="form-radio"
              name="accountType"
              onChange={() => handleOptionChange(false)}
            />
            <span className="ml-2">No</span>
          </label>
        </div>

        {bet && (
          <div className="my-4">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="bettingAmount"
            >
              Staking Amount
            </label>
            <input
              onChange={(e) => setBettingAmoun(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="bettingAmount"
              placeholder="Set Staking Amount"
            />
          </div>
        )}

        <div className="mb-4">
          <span className="block">Game Apparatus</span>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              checked
              name="apparatus"
              value="die"
            />
            <span className="ml-2">Die</span>
          </label>
          <label className="inline-flex items-center ml-6">
            <input
              type="radio"
              className="form-radio"
              disabled
              name="apparatus"
              value="roulette"
            />
            <span className="ml-2">Roulette</span>
          </label>
        </div>

        <div className="mb-4">
          <span className="block">Mode</span>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              disabled
              name="mode"
              value="turn"
            />
            <span className="ml-2">Turn Based</span>
          </label>
          <label className="inline-flex items-center ml-6">
            <input
              type="radio"
              className="form-radio"
              checked
              name="mode"
              value="score"
            />
            <span className="ml-2">Score Based</span>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <Button disabled={loading} className="w-[200px]" type="submit">
            {loading ? 'Creating ...' : 'Create Game'}
          </Button>
          {hasUserDeposited === false && (
            <Button className="w-[200px]" type="button" onClick={depositErc20Handler}>
              {depositing ? 'Depositing ...' : 'Deposit'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default CreateGameModal
