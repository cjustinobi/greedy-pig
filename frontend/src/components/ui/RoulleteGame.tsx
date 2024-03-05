import { useEffect, useRef, useState } from 'react'
import Roulette from '@/components/ui/Roulette'
import { useRollups } from '@/hooks/useRollups'
import { dappAddress, getParticipantsForGame } from '@/lib/utils'
import { addInput, sendEther } from '@/lib/cartesi'
import Button from '../shared/Button'
import { useConnectWallet } from '@web3-onboard/react'
import toast from 'react-hot-toast'

export default function RoulleteGame({ notices }: any) {
  const [{ wallet }] = useConnectWallet()
  const rollups = useRollups(dappAddress)
  const noticesRef = useRef(notices)

  const [gameId, setGameId] = useState<string>('')
  const [players, setPlayers] = useState<string[]>([])
   const [game, setGame] = useState<any>(null)

  const joinGame = async (id: any) => {
    const res = await sendEther(1, rollups)
    const txHash = await res.wait(1)
    if (txHash) {
      const addr: string | undefined = wallet?.accounts[0].address

      const jsonPayload = JSON.stringify({
        method: 'addParticipant',
        data: { gameId: id, playerAddress: addr },
      })

      const tx = await addInput(JSON.stringify(jsonPayload), dappAddress, rollups)

      const result = await tx.wait(1)
      console.log(result)
    } else {
      toast.error('Ether not sent')
    }

    
  }

  useEffect(() => {
    noticesRef.current = notices // Update the ref value whenever notices changes
  }, [notices])

  useEffect(() => {
    const id = window.location.pathname.split('/').pop()
    if (id && notices && notices.length > 0) {
      setGameId(id)
      getParticipantsForGame(gameId, notices).then((fetchedPlayers) => {
        setPlayers(fetchedPlayers)
      })
      const game = JSON.parse(notices[notices.length - 1].payload).find(
          (game: any) => game.id === gameId
        )
        setGame(game)
    }
  }, [gameId, notices])

  // useEffect(() => {
  //   rollups?.inputContract.on(
  //     'InputAdded',
  //     (dappAddress, inboxInputIndex, sender, input) => {
  //       handleEvent(dappAddress, inboxInputIndex, sender, input)
  //     }
  //   )
  // }, [rollups])

  return (
    <div>
      {game && game.status === 'New' && <Button onClick={() => joinGame(gameId)} className="mb-10" type="button">
        Join Game
      </Button>}
      {/* <Button onClick={playGame} className="mb-10" type="button">
        Play Game
      </Button> */}
      <Roulette 
        gameId={gameId} 
        players={players} 
        notices={notices}
        />
    </div>
  )
}
