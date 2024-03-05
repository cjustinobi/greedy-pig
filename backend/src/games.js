const { v4: uuidv4 } = require('uuid')
import { Wallet } from 'cartesi-wallet'

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL
const wallet = new Wallet(new Map())

export const games = []

export const addGame = (game) => {
  const gameFound = games.length ? games.find(g => g.id === game.id) : null

  if (gameFound) {
    if (gameFound) {
      return errorResponse(true, 'Game already exist')
    }
  }

  games.push({ ...game, id: uuidv4()})
  return errorResponse(false)
}

export const addParticipant = ({gameId, playerAddress}) => {

  const game = games.find(game => game.id === gameId)

  if (!game) {
    if (gameFound) {
      return errorResponse(true, 'Game not found')
    }
  }

  const participant = game.participants.find(p => p.address === playerAddress)

  if (participant) {
    if (gameFound) {
      return errorResponse(true, 'Participant already exist')
    }
  }


  game.participants.push({
    address: playerAddress,
    playerInfo: {
      turn: 0,
      turnScore: 0,
      totalScore: 0
    }
  })

  if (game.gameSettings.bet) {
    game.bettingFund += game.bettingAmount
  }

  if (!game.activePlayer) {
    game.activePlayer = game.participants[0].address;
  }
  return errorResponse(false)
}

const gamePlay = async (gameId, playerAddress) => {

  const game = games.find(game => game.id === gameId)

  const participant = game.participants.find(p => p.address === playerAddress)

  const startAngle = Math.floor(Math.random() * 10 + 10) // 10 to 19.999
  console.log('startAngle ', startAngle)
  const rollOutcome = calcScore(startAngle)

  if (rollOutcome === 1) {
    console.log('roll outcome is ', rollOutcome)
    participant.playerInfo.turn += 1;
    // cancel all acumulated point for the turn
    participant.playerInfo.turnScore = 0; // Reset turn score for the next turn
    game.activePlayer = game.participants[(game.participants.findIndex(p => p.address === playerAddress) + 1) % game.participants.length].address; // Move to the next player's turn or end the game
    game.startAngle = 0; // Reset the roll outcome
    return;

  } else {
    console.log('roll outcome is ', rollOutcome)
    console.log('start angle ', startAngle)
    game.startAngle = startAngle; // Update the roll outcome
    participant.playerInfo.turnScore += rollOutcome
    return
  }

}


// Define a function to handle player responses
export const gamePlayHandler = ({gameId, playerAddress, response}) => {
  
  const game = games.find(game => game.id === gameId)

  if (!game) {
    return errorResponse(true, 'Game not found')
  }

  if (game.status === getGameStatus('ended')) {
    return errorResponse(true, 'Game ended')
  } else {
    game.status = getGameStatus('inProgress')
  }

  const particpants = getParticipantsForGame(gameId)

  if (particpants.length < 2) {
    return errorResponse(true, 'Not enough players')
  }

  const activePlayer = game.activePlayer === playerAddress

  if (!activePlayer) {
    return errorResponse(true, `It is not ${playerAddress}'s turn`)
  }

  const activeParticipant = game.participants.find(p => p.address === playerAddress)

  if (!activeParticipant) {
    return errorResponse(true, 'Participant not found')
  }

   // if he has exhausted all his turn.
  if (game.gameSettings.mode === 'turn' && activeParticipant.playerInfo.turn === game.gameSettings.numbersOfTurn) {
    return errorResponse(true, 'You have exhausted your turn')
  }
 
  if (response === 'yes') {
    try {
      gamePlay(gameId, playerAddress)
    } catch (error) {
      return errorResponse(true, error)
    }
  } else if (response === 'no') {
    // End the player's turn and move to the next player or finish the game
    activeParticipant.playerInfo.totalScore += activeParticipant.playerInfo.turnScore; // Add turn score to total score
    activeParticipant.playerInfo.turnScore = 0; // Reset turn score for the next turn
    activeParticipant.playerInfo.turn += 1; 

    // Move to the next player's turn or end the game

    const currentPlayerIndex = game.participants.findIndex(p => p.address === playerAddress);
    // Determine the index of the next player
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.participants.length; // Circular iteration
    // Update active player
    game.activePlayer = game.participants[nextPlayerIndex].address;
  }

  const allPlayersFinished = game.participants.every(
    (participant) => participant.playerInfo.turn >= game.gameSettings.numbersOfTurn
  );

  if (allPlayersFinished) {
    console.log('ending game ...')
    endGame(game)
    transferToWinner(game)
    return errorResponse(false)
  }

  return errorResponse(false)
}

const getParticipantsForGame = gameId => {

  const game = games.find(game => game.id === gameId)

  if (!game) {
    return []
  }

  return game.participants.map(participant => participant.address)
  
}

const calculateWinner = game => {
  let highestScore = 0;
  let winnerAddress = null;

  for (const participant of game.participants) {
    const totalScore = participant.playerInfo.totalScore;
    if (totalScore > highestScore) {
      highestScore = totalScore;
      winnerAddress = participant.address;
    }
  }

  return winnerAddress;
}


const endGame = game => {

  const winner = calculateWinner(game)

  game.activePlayer = ''
  game.status = getGameStatus('ended')
  game.startAngle = 0
  game.winner = winner
  return
 
}

const transferToWinner = async (game) => {
  // Transfer to the winner.
  // ether_withdraw: (rollup_address: Address, account: Address, amount: bigint) => Voucher | Error_out;
  if (game.gameSettings.bet && game.status === 'Ended') {
    console.log('transfering to winner: ', game.winner)
    const rollupAddr = '0xFfdbe43d4c855BF7e0f105c400A50857f53AB044'
     try {
        let voucher = wallet.ether_withdraw(rollupAddr, game.winner, BigInt(game.bettingFund))
        await fetch(rollup_server + "/voucher", {
          method: "POST", headers: { "Content-Type": "application/json", },
          body: JSON.stringify({ payload: voucher.payload, destination: voucher.destination }),
        });
      } catch (error) {
        console.log(error)
        return errorResponse(true, error)
      }
  }
}

const errorResponse = (error, message = '') => {
  return { error, message }
}

const calcScore = (startAngle) => {
  const options = [1, 2, 3, 4, 5, 6]
  const degrees = startAngle * 180 / Math.PI + 90;
  const arc = Math.PI / (options.length / 2)
  const arcd = arc * 180 / Math.PI
  const index = Math.floor((360 - degrees % 360) / arcd)
  return options[index]
}

const getGameStatus = status => {
  switch (status) {
    case 'new':
      return 'New'
    case 'inProgress':
      return 'In Progress'
    case 'ended':
      return 'Ended'
    case 'cancel':
      return 'Canceled'
    default:
      return 'New'
  }
}


///////////////////////


const gameStructure = () => {
  return {
   creator: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
   activePlayer: '',
   gameName: 'Justin Obi',
   participants: [
     {
       address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
       playerInfo: {
        turn: 0,
        turnScore: 0,
        totalScore: 0
       }
     },
     {
       address: '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199',
       playerInfo: {
        turn: 0,
        turnScore: 0,
        totalScore: 0
       }
     },
     {
       address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
       playerInfo: {
        turn: 0,
        turnScore: 0,
        totalScore: 0
       }
     }
   ],
   gameSettings: {
     numbersOfTurn: 2,
     winningScore: 0,
     mode: 'turn',
     apparatus: 'roulette',
     bet: true,
     maxPlayer: 10,
     limitNumberOfPlayer: true
   },
   status: 'New',
   startTime: '2024-02-20T11:28',
   id: 'j57c7p49x610z9q2s63xbz7rk56ktg8v',
   startAngle: 0,
   bettingAmount: 0,
   bettingFund: 0,
   winner: ''
 }
}




