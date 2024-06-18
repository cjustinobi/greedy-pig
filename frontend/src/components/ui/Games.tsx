import { useEffect, useState } from 'react'
import { GameStatus } from '@/interfaces'
import GameCard from './GameCard'
import { useNotices } from '@/hooks/useNotices'
import { IGame } from '@/interfaces'
import { dappAddress } from '@/lib/utils'
import { useRollups } from '@/hooks/useRollups'
import { useDispatch } from 'react-redux'
import { useConnectWallet } from '@web3-onboard/react'
import toast from 'react-hot-toast'
import Button from '../shared/Button'

const Games = () => {
  const { notices, refetch } = useNotices()
  const rollups = useRollups(dappAddress)
  const dispatch = useDispatch()
  const [{ wallet }] = useConnectWallet()

  const [status, setStatus] = useState<GameStatus>(GameStatus.New)
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value as GameStatus)
  }

  const modalHandler = () => {
    if (!wallet) return toast.error('Connect Wallet to continue')
    dispatch({ type: 'modal/toggleGameModal' })
  }

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
    <div>
      <h1 className="mt-4 mb-0 text-gray-500 text-center text-2xl font-bold cursor-pointer">
        {status} Games
      </h1>

      <div className="bg-gradient-to-r from-black-500 to-brown-800 via-[#333]">
        <div className="md:w-[300px] md:px-10">
          <select
            value={status}
            onChange={handleStatusChange}
            id="small"
            className="block w-full p-2 mb-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value={GameStatus.New}>New</option>
            <option value={GameStatus.InProgress}>In Progress</option>
            <option value={GameStatus.Cancelled}>Cancelled</option>
            <option value={GameStatus.Ended}>Ended</option>
          </select>
        </div>
        <div className="md:px-4 md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 space-y-4 md:space-y-0">
          {notices && notices.length > 0 && Array.isArray(JSON.parse(notices[0].payload)) && (
            JSON.parse(notices[0].payload)
              .filter((game: IGame) => game.status === status)
              .reverse()
              .map((game: IGame) => <GameCard key={game.id} game={game} />)
          )}
        </div>
        {notices && notices.length === 0 && (
          <div className="flex flex-row justify-center">
            <p>No game found</p>
            <Button className="w-[200px]" onClick={modalHandler}>
              Create Game
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Games
