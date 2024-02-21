import { useSelector } from 'react-redux'


import { EmptyPage } from '../shared/EmptyPage'
import { useEffect, useState } from 'react'
import { GameStatus } from '@/interfaces'
import { selectSelectedGame } from '@/features/games/gamesSlice'
import { useRollups } from '@/hooks/useRollups'
import { dappAddress } from '@/lib/utils'
import { useNotices } from '@/hooks/useNotices'


const LeaderBoard = () => {

  const { notices } = useNotices()
  const rollups = useRollups(dappAddress)
  const game = useSelector((state: any) =>
    selectSelectedGame(state.games)
  )
  
  console.log('notices from leasdboard', notices)


  const [status, setStatus] = useState<GameStatus>(GameStatus.New);



  useEffect(() => {
        // Subscribe to the event here
        
        const subscription = rollups?.inputContract.on('InputAdded', (
          dappAddress, 
          inboxInputIndex,
          sender,
          input
          ) => {
            // Define your callback function to handle the event
            handleEvent(dappAddress, 
          inboxInputIndex,
          sender,
          input);
        });

        console.log('subscription ', subscription)


        // return () => {
        //     subscription;
        // };
    }, [rollups]);

    // Define the callback function to handle the event
    const handleEvent = (dappAddress: string, 
          inboxInputIndex: string,
          sender: string,
          input: string) => {
        // Perform the action based on the emitted event
        console.log('Received event:', dappAddress, 
          inboxInputIndex,
          sender,
          input);

    };

  return (
    <div className="relative flex flex-col w-full min-w-0 break-words border-0 border-transparent border-solid shadow-soft-xl rounded-2xl bg-clip-border mb-4 draggable">
      <div className="p-6 pb-0 mb-0 rounded-t-2xl">
        <h1 className="font-bold text-2xl mb-10">Leaderboard</h1>
      </div>
      
      {game && game.participants?.length ? (
        <div className="flex-auto px-0 pt-0 pb-2">
          <div className="p-0 overflow-x-auto">
            <table className="items-center w-full mb-0 align-top border-gray-200 text-slate-500">
              <thead className="align-bottom">
                <tr>
                  <th className="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">
                    Player
                  </th>
                  <th className="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">
                    Round
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
                {game.participants.length &&
                  game.participants.map((player: any, i: number) => (
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
                              {player.address}
                            </h6>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <p className="mb-0 font-semibold leading-tight text-xs">
                          {player.playerInfo?.turn}
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
