const { 
  verifyCommitment,
  resetMoveCommitment,
  getParticipantsMove,
  generateRollOutcome
 } = require('./utils/helpers')

const { v4: uuidv4 } = require('uuid')
const { Wallet } = require('cartesi-wallet')
const { Router } = require('cartesi-router')
const { ethers } = require('ethers')

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL
const wallet = new Wallet(new Map())
const router = new Router(wallet)


export const games = []

export const withdraw = async (data) => {
  return router.process('withdraw', data)
}

export const addGame = (game) => {
  const gameFound = games.length ? games.find(g => g.id === game.id) : null

  if (gameFound) {
    return errorResponse(true, 'Game already exist')
  }


  games.push({ ...game, id: uuidv4(), dateCreated: Date.now()})
  return errorResponse(false)
}

export const addParticipant = async ({gameId, playerAddress}) => {

  const game = games.find(game => game.id === gameId)

  if (!game) {
    return errorResponse(true, 'Game not found')
  }

  const participant = game.participants.find(p => p.address === playerAddress)

  if (participant) {
    return errorResponse(true, 'Participant already exist')
  }


  game.participants.push({
    address: playerAddress,
    playerInfo: {
      turn: 0,
      turnScore: 0,
      totalScore: 0
    },
    commitment: null,
    move: null,
    deposited: false
  })

  if (game.gameSettings.bet) {
    game.bettingFund += game.bettingAmount
  }

  if (!game.activePlayer) {
    game.activePlayer = game.participants[0].address;
  }
  return errorResponse(false)
}

export const commit = (gameId, commitment, playerAddress) => {

  const game = games.find(game => game.id === gameId)

  if (!game) {
    return errorResponse(true, 'Game not found')
  }

  if (game.status === getGameStatus('ended')) {
    return errorResponse(true, 'Game ended')
  }

  const participant = game.participants.find(p => p.address.toLowerCase() === playerAddress)

   if (!participant) {
    return errorResponse(true, 'Participant not found')
  }

  if (participant.commitment) {
    return errorResponse(true, 'Commitment already exist')
  }

  if (participant.move) {
    return errorResponse(true, 'Move already exist')
  }


  if (!game.commitPhase) {
    game.commitPhase = true
  } 

  console.log(`committed for ${playerAddress}`)
  participant.commitment = commitment
  return errorResponse(false)

}

export const reveal = (gameId, move, nonce, playerAddress) => {

  const game = games.find(game => game.id === gameId)

  if (!game) {
    return errorResponse(true, 'Game not found')
  }
  
  const participant = game.participants.find(p => p.address.toLowerCase() === playerAddress)

  if (!participant) {
    return errorResponse(true, 'Participant not found')
  }

  if (participant.move) {
    return errorResponse(true, 'Move already exist')
  }

  const isVerified = verifyCommitment(participant.commitment, move, nonce)

  if (!isVerified) return errorResponse(true, 'Invalid commitment')

  if (!game.revealPhase) {
    game.revealPhase = true
  }
  if (game.commitPhase) {
    game.commitPhase = false
  }

  console.log(`revealed for ${playerAddress}`)
  participant.move = parseInt(move)
  return errorResponse(false)
}

export const rollDice = async ({gameId, playerAddress}) => {

  const game = games.find(game => game.id === gameId)

  const participant = game.participants.find(p => p.address === playerAddress)

  const moves = getParticipantsMove(game)
  console.log('moves', moves)
  const rollOutcome = generateRollOutcome(moves)
  console.log('roll outcome is ', rollOutcome)

  if (rollOutcome === 1) {

    participant.playerInfo.turn += 1;
    // cancel all acumulated point for the turn
    participant.playerInfo.turnScore = 0; // Reset turn score for the next turn
    game.activePlayer = game.participants[(game.participants.findIndex(p => p.address === playerAddress) + 1) % game.participants.length].address; // Move to the next player's turn or end the game
    game.rollOutcome = rollOutcome
    resetMoveCommitment(game)
    return;

  } else {

    game.rollOutcome = rollOutcome; // Update the roll outcome
    participant.playerInfo.turnScore += rollOutcome

    const totalScore = participant.playerInfo.turnScore + participant.playerInfo.totalScore
    console.log('totalScore', totalScore)
    if (game.gameSettings.mode === 'score' && totalScore >= game.gameSettings.winningScore) {
      
      console.log('ending game ...')
      participant.playerInfo.totalScore += participant.playerInfo.turnScore
      participant.playerInfo.turnScore = 0
      endGame(game);
      transferToWinner(game);
      return errorResponse(false);

    } else {

      const allPlayersFinished = game.participants.every((participant) => participant.playerInfo.turn >= game.gameSettings.numbersOfTurn );

      if (allPlayersFinished) {
        console.log('ending game ...')
        endGame(game)
        transferToWinner(game)
        return errorResponse(false)
      }
      resetMoveCommitment(game)
    }
    return
  }

}


// Define a function to handle player responses
export const playGame = ({gameId, playerAddress, response, commitment}) => {
  
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
      console.log('commiting ....')
      commit(gameId, commitment, playerAddress)
      // gamePlay(gameId, playerAddress)
    } catch (error) {
      return errorResponse(true, error)
    }
  } else if (response === 'no') {
    // End the player's turn and move to the next player or finish the game
    activeParticipant.playerInfo.totalScore += activeParticipant.playerInfo.turnScore; // Add turn score to total score
    activeParticipant.playerInfo.turnScore = 0; // Reset turn score for the next turn
    activeParticipant.playerInfo.turn += 1; 

    const currentPlayerIndex = game.participants.findIndex(p => p.address === playerAddress);
    // Determine the index of the next player
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.participants.length; // Circular iteration
    // Update active player
    game.activePlayer = game.participants[nextPlayerIndex].address;
    game.rollOutcome = 0
  }

  // resetMoveCommitment(game)

  return errorResponse(false)
}

export const updateBalance = async (playerAddress, amount, gameId) => {

  const formattedAmount = parseFloat(ethers.formatEther(amount))
  console.log('formatted amount ', formattedAmount)
  const game = games.find(game => game.id === gameId)
  const participant = game.participants.find(p => p.address === playerAddress)

  // check if the deposited amount equals game bet amount

  if (formattedAmount < game.gameSettings.bettingAmount) {
    console.log('Amount deposited is less than betting amount')
    return errorResponse(true, 'Amount deposited is less than betting amount')
  }

  participant.deposited = true
  console.log('deposited ', formattedAmount)
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

  // const winner = calculateWinner(game)

  game.status = getGameStatus('ended')
  game.winner = game.activePlayer
  // game.activePlayer = ''
  return
 
}

const transferToWinner = async (game) => {

  if (game.gameSettings.bet && game.status === 'Ended') {
    const winnerAddress = game.winner.toLowerCase();
    try {
      for (const participant of game.participants) {
        if (participant.address.toLowerCase() !== winnerAddress) {
          const res = await wallet.ether_transfer(participant.address, winnerAddress, ethers.parseEther(game.bettingAmount));
          console.log(`Transferred ${game.bettingAmount} to winner from ${participant.address}`);
          console.log('Result from transfer ', res);
        }
      }
      game.paidOut = true
    } catch (error) {
      console.log('Error from transfer ', error);
    }
    // try {
    //   const res = wallet.ether_transfer('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', game.winner, ethers.parseEther(game.bettingAmount));
  
    //   console.log('result from transfer ', res)
    // } catch (error) {
    //   console.log('error from transfer ', error)
    // }
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
   commit: false,
   participants: [
     {
      move: '',
      commitment: '',
       address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
       playerInfo: {
        turn: 0,
        turnScore: 0,
        totalScore: 0
       }
     },
     {
      move: '',
      commitment: '',
       address: '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199',
       playerInfo: {
        turn: 0,
        turnScore: 0,
        totalScore: 0
       }
     },
     {
      move: '',
      commitment: '',
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
     mode: 'turn', // turn || score
     apparatus: 'roulette', // roulette || dice
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




