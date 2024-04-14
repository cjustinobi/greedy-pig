import { FC, memo, useCallback, useEffect, useState } from 'react'
import { EmptyPage } from '@/components/shared/EmptyPage'
import { dappAddress, shortenAddress } from '@/lib/utils'
import { useNotices } from '@/hooks/useNotices'
import { useRollups } from '@/hooks/useRollups'
import useAudio from '@/hooks/useAudio'
import toast from 'react-hot-toast'
import { addInput } from '@/lib/cartesi'

interface LeaderBoardProps {
  game: any
}

const LeaderBoard: FC<LeaderBoardProps> = ({ game }) => {
// const LeaderBoard: FC<LeaderBoardProps> = memo(({ game }) => {
  const gameOverSound = useAudio('/sounds/gameOver.mp3')
  const { refetch } = useNotices()
  const rollups = useRollups(dappAddress)
  const [delayedGame, setDelayedGame] = useState<any>(null)

    const transfer = async () => {
      const jsonPayload = JSON.stringify({
        method: 'transfer',
        // from: (wallet?.accounts[0].address)?.toLowerCase(),
        from: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        ether: '0xFfdbe43d4c855BF7e0f105c400A50857f53AB044',
        amount: 1000000000000000000,
      })

      await addInput(JSON.stringify(jsonPayload), dappAddress, rollups)
    }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDelayedGame(game)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [game])

  const currentGame = delayedGame || game

  const handleEvent = useCallback(async () => {
    await refetch()
  }, [refetch])

  useEffect(() => {
    rollups?.inputContract.on(
      'InputAdded',
      (dappAddress, inboxInputIndex, sender, input) => {
        handleEvent()
      }
    )
  }, [handleEvent, rollups])

  useEffect(() => {
    if (game?.status === 'Ended') {
      gameOverSound?.play()
      toast.success(`${game.winner} won`)
      // transfer()
    }
  }, [game?.status, gameOverSound])

  return (
    <div className="relative flex flex-col w-full min-w-0 break-words border-0 border-transparent border-solid shadow-soft-xl rounded-2xl bg-clip-border mb-4 draggable">
      <div className="p-6 pb-0 mb-0 rounded-t-2xl">
        <h1 className="font-bold text-2xl mb-10">
          {currentGame?.gameName} Leaderboard
        </h1>
        <span>
          Winning score:{' '}
          <span className="font-bold">
            {currentGame?.gameSettings?.winningScore}
          </span>
        </span>
      </div>

      {currentGame && currentGame.participants?.length ? (
        <div className="flex-auto px-0 pt-0 pb-2">
          <div className="p-0 overflow-x-auto">
            <table className="items-center w-full mb-0 align-top border-gray-200 text-slate-500">
              <thead className="align-bottom">
                <tr>
                  <th className="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">
                    Player
                  </th>
                  <th className="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">
                    Move
                  </th>
                  <th className="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">
                    Turn Score
                  </th>
                  <th className="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">
                    Total Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentGame.participants.length &&
                  currentGame.participants.map((player: any, i: number) => (
                    <tr key={i}>
                      {/* <tr key={i} className={player.username === activePlayer ? 'bg-gray-100' : ''}> */}
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <div className="flex px-2 py-1">
                          <div>
                            <img
                              src="https://demos.creative-tim.com/soft-ui-dashboard-tailwind/assets/img/team-2.jpg"
                              className="inline-flex items-center justify-center mr-4 text-white transition-all duration-200 ease-soft-in-out text-sm h-9 w-9 rounded-xl"
                              alt="user1"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h6 className="mb-0 leading-normal text-sm">
                              {shortenAddress(player.address)}
                            </h6>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <p className="mb-0 font-semibold leading-tight text-xs">
                          {currentGame.revealPhase && player.move ? player.move : 'No move yet'}
                        </p>
                      </td>
                      <td className="p-2 text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="font-semibold leading-tight text-xs text-slate-400">
                          {player.playerInfo?.turnScore}
                        </span>
                      </td>
                      <td className="p-2 text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="font-semibold leading-tight text-xs text-slate-400">
                          {player.playerInfo?.totalScore}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyPage text="No Participant" />
      )}
    </div>
  )
}

export default LeaderBoard
