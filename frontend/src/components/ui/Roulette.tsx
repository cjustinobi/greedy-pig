import { FC, useCallback, useEffect, useRef, useState } from 'react'
import Button from '@/components/shared/Button'
import toast from 'react-hot-toast'
import { addInput } from '@/lib/cartesi'
import { dappAddress, parseInputEvent } from '@/lib/utils'
import { useRollups } from '@/hooks/useRollups'
import { useConnectWallet } from '@web3-onboard/react'
import ConfirmModal from './ConfirmModal'
import { useDispatch } from 'react-redux'
// import gameOverSound from '/sounds/game-over.mp3'

interface RouletteProps {
  gameId: string
  players: string[]
  notices: any
}

const Roulette: FC<RouletteProps> = ({ gameId, players, notices }) => {
  const dispatch = useDispatch()
  const [{ wallet }] = useConnectWallet()
  const rollups = useRollups(dappAddress)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const noticesRef = useRef(notices)

  // const [audio] = useState(new Audio(gameOverSound));
  const [activePlayer, selectActivePlayer] = useState<string>('')
  const [startAngle, setStartAngle] = useState<number>(0)
  const [spinAngleStart, setSpinAngleStart] = useState<number>(0)
  const [game, setGame] = useState<any>()

  const options = [1, 2, 3, 4, 5, 6]
  // let startAngle = 0;
  const arc = Math.PI / (options.length / 2)
  let spinTimeout: NodeJS.Timeout | null = null
  let spinTime = 0
  let spinTimeTotal = 0
  let ctx: CanvasRenderingContext2D | null = null

  const byte2Hex = (n: number): string => {
    const nybHexString = '0123456789ABCDEF'
    return (
      String(nybHexString.substr((n >> 4) & 0x0f, 1)) +
      nybHexString.substr(n & 0x0f, 1)
    )
  }

  const RGB2Color = (r: number, g: number, b: number): string => {
    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b)
  }

  const getColor = (item: number, maxitem: number): string => {
    const phase = 0
    const center = 128
    const width = 127
    const frequency = (Math.PI * 2) / maxitem

    let red = Math.sin(frequency * item + 2 + phase) * width + center
    let green = Math.sin(frequency * item + 0 + phase) * width + center
    let blue = Math.sin(frequency * item + 4 + phase) * width + center

    return RGB2Color(red, green, blue)
  }

  const drawRouletteWheel = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const outsideRadius = 200
      const textRadius = 160
      const insideRadius = 125

      ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2

        ctx.font = 'bold 36px Helvetica, Arial'

        for (let i = 0; i < options.length; i++) {
          const angle = startAngle + i * arc
          ctx.fillStyle = getColor(i, options.length)

          ctx.beginPath()
          ctx.arc(250, 250, outsideRadius, angle, angle + arc, false)
          ctx.arc(250, 250, insideRadius, angle + arc, angle, true)
          ctx.stroke()
          ctx.fill()

          ctx.save()
          ctx.shadowOffsetX = -1
          ctx.shadowOffsetY = -1
          ctx.shadowBlur = 0
          ctx.shadowColor = 'rgb(220,220,220)'
          ctx.fillStyle = 'black'
          ctx.translate(
            250 + Math.cos(angle + arc / 2) * textRadius,
            250 + Math.sin(angle + arc / 2) * textRadius
          )
          ctx.rotate(angle + arc / 2 + Math.PI / 2)
          const text = options[i]
          ctx.fillText(
            text.toString(),
            -ctx.measureText(text.toString()).width / 2,
            0
          )
          ctx.restore()
        }

        // Arrow
        ctx.fillStyle = 'black'
        ctx.beginPath()
        ctx.moveTo(250 - 4, 250 - (outsideRadius + 5))
        ctx.lineTo(250 + 4, 250 - (outsideRadius + 5))
        ctx.lineTo(250 + 4, 250 - (outsideRadius - 5))
        ctx.lineTo(250 + 9, 250 - (outsideRadius - 5))
        ctx.lineTo(250 + 0, 250 - (outsideRadius - 13))
        ctx.lineTo(250 - 9, 250 - (outsideRadius - 5))
        ctx.lineTo(250 - 4, 250 - (outsideRadius - 5))
        ctx.lineTo(250 - 4, 250 - (outsideRadius + 5))
        ctx.fill()
      }
    }
  }

  const handleResponse = (response: string) => {
    playGame(response)
  }

  const playGame = async (response: string) => {
    const playerAddress = wallet?.accounts[0].address

    if (game.status === 'Ended') {
      return toast.error('Game has ended')
    }

    if (activePlayer !== playerAddress) {
      return toast.error('Not your turn')
    }

    if (!playerAddress) return toast.error('Player not connected')

    if (players.length >= 2) {
      
      const playerAddress = wallet?.accounts[0].address

      game.status === 'New' ? dispatch({ type: 'leaderboard/initTurnSync', payload: true}) : ''

      dispatch({ type: 'modal/toggleConfirmModal' })

      try {
        const jsonPayload = JSON.stringify({
          method: 'playGame',
          data: { gameId, playerAddress, response }
        })

        const tx = await addInput(
          JSON.stringify(jsonPayload),
          dappAddress,
          rollups
        )
        
        console.log('roulette tx ', tx)
        const result = await tx.wait(1)

      } catch (error) {
        console.error('Error during game:', error)
      }

      spinTime = 0;
      spinTimeTotal = 20000 // Math.random() * 3 + 4 * 1000;

    } else {
      toast.error('Not enough players to play')
    }
  }


 const spin = useCallback(() => {
  console.log(game?.startAngle);
setStartAngle(game?.startAngle);
    setSpinAngleStart(Math.random() * 10 + 10) // 10 to 19.999
    spinTime = 0;
    spinTimeTotal = 20000  // 4000 to 7999
    rotateWheel();
  }, [game?.startAngle])

  const rotateWheel = () => {
    spinTime += 30

    if (spinTime >= spinTimeTotal || !ctx) {
      stopRotateWheel()
      return
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal)

    const newStartAngle = startAngle + (spinAngle * Math.PI / 180);
  setStartAngle(newStartAngle);
    drawRouletteWheel()
    // spinTimeout = setTimeout(rotateWheel, 30)
     window.requestAnimationFrame(rotateWheel);
  }

  const stopRotateWheel = () => {
    if (spinTimeout) clearTimeout(spinTimeout)
    if (!ctx) return
    const degrees = (startAngle * 180) / Math.PI + 90
    const arcd = (arc * 180) / Math.PI
    const index = Math.floor((360 - (degrees % 360)) / arcd)
    ctx.save()
    ctx.font = 'bold 90px Helvetica, Arial'
    ctx.fillStyle = 'blue'
    const text = options[index]
    ctx.fillText(
      text?.toString(),
      250 - ctx.measureText(text.toString()).width / 2,
      250 + 10
    )
    ctx.restore()

    dispatch({ type: 'modal/toggleConfirmModal' });
  }

  const easeOut = (t: number, b: number, c: number, d: number) => {
    const ts = (t /= d) * t
    const tc = ts * t
    return b + c * (tc + -3 * ts + 3 * t)
  }

  useEffect(() => {
    drawRouletteWheel()
    return () => {
      if (spinTimeout) clearTimeout(spinTimeout)
    }
  })

  useEffect(() => {
    rollups?.inputContract.on(
      'InputAdded',
      (dappAddress, inboxInputIndex, sender, input) => {
        if (parseInputEvent(input).method === 'playGame') {
          console.log('playgame')
        }
      }
    )
  }, [rollups])

  useEffect(() => {
    noticesRef.current = notices
  }, [notices])

  useEffect(() => {
    if (notices && notices.length > 0) {
      if (gameId) {
        const game = JSON.parse(notices[notices.length - 1].payload).find(
          (game: any) => game.id === gameId
        )
        if (game) {
          setGame(game)
          console.log(`game angle , ${game.startAngle}`)
          spin()
          selectActivePlayer(game.activePlayer)
  
          if (game.status === 'Ended') {
            // audio.play(); // Play the audio when the game is over
            toast.success('Game has ended');
          }
        
        }
      }
    }
  }, [notices, gameId, spin])

  return (
    <div>
      {game && game.status !== 'Ended' && <Button
        type="button"
        id="spin"
        onClick={() => dispatch({ type: 'modal/toggleConfirmModal' })}
      >
        Play Game
      </Button>}
      <canvas id="canvas" width="500" height="500" ref={canvasRef}></canvas>
      <ConfirmModal onSubmit={handleResponse} activePlayer={activePlayer} />
    </div>
  )
}

export default Roulette
