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


const games = []

const withdraw = async (data) => {
  return router.process('withdraw', data)
}

const addGame = async (game) => {
  const gameFound = games.length ? games.find(g => g.id === game.id) : null

  if (gameFound) {
    return errorResponse(true, 'Game already exist')
  }

  // if (game.gameSettings.winningScore < 6) {
  //   return errorResponse(true, 'Game winning score should not be less than 6')
  // }

  const newGame = { ...game, id: uuidv4(), dateCreated: Date.now() }
  games.push(newGame)

  // add participant
  await addParticipant({
    gameId: newGame.id,
    playerAddress: game.creator
  })
  
  return errorResponse(false)
}

const addParticipant = async ({gameId, playerAddress}) => {

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

  if (game?.gameSettings.bet) {
    game.bettingFund = +game.bettingAmount + +game.bettingFund
  }

  if (!game.activePlayer) {
    game.activePlayer = game.participants[0].address;
  }
  return errorResponse(false)
}

const commit = (gameId, commitment, playerAddress) => {

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

  const allPlayersCommitted = game.participants.every((participant) => participant.commitment !== null)

  if (allPlayersCommitted) {
    game.commitPhase = false
  }

  return errorResponse(false)

}

const reveal = (gameId, move, nonce, playerAddress) => {

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

  const allPlayersRevealed = game.participants.every((participant) => participant.move !== null)

  if (allPlayersRevealed) {
    game.revealPhase = false
  }

  return errorResponse(false)
}

const rollDice = async ({gameId, playerAddress}) => {

  const game = games.find(game => game.id === gameId)

  const participant = game.participants.find(p => p.address === playerAddress)

  const moves = getParticipantsMove(game)
  console.log('moves', moves)
  const rollOutcome = generateRollOutcome(moves)
  console.log('roll outcome is ', rollOutcome)

  if (rollOutcome === 1) {

    participant.playerInfo.turn += 1
  
    participant.playerInfo.turnScore = 0
    game.activePlayer = game.participants[(game.participants.findIndex(p => p.address === playerAddress) + 1) % game.participants.length].address; // Move to the next player's turn or end the game
    game.rollOutcome = rollOutcome
    game.rollCount += 1
    resetMoveCommitment(game)
    return;

  } else {

    game.rollOutcome = rollOutcome
    game.rollCount += 1
    participant.playerInfo.turnScore += rollOutcome

    const totalScore = participant.playerInfo.turnScore + participant.playerInfo.totalScore
    console.log('totalScore', totalScore)
    if (game.gameSettings.mode === 'score' && totalScore >= game.gameSettings.winningScore) {
      
      console.log('ending game ...')
      participant.playerInfo.totalScore += participant.playerInfo.turnScore
      participant.playerInfo.turnScore = participant.playerInfo.turnScore
      endGame(game);
      transferToWinner(game);
      return errorResponse(false)

    } else {

      const allPlayersFinished = game.participants.every((participant) => participant.playerInfo.turn >= game.gameSettings.numbersOfTurn );

      if (allPlayersFinished) {
        console.log('ending game ...')
        endGame(game)
        // transferToWinner(game)
        return errorResponse(false)
      }
      resetMoveCommitment(game)
    }
    return
  }

}


// Define a function to handle player responses
const playGame = ({gameId, playerAddress, response, commitment}) => {
  
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

const transferToWinner = async (game, rollupAddress) => {

  if (game?.gameSettings.bet && game.status === 'Ended') {

    const winnerAddress = game.winner.toLowerCase();

    // ether_withdraw: (rollup_address: Address, account: Address, amount: bigint) => Voucher | Error_out;
// ether_transfer: (account: Address, to: Address, amount: bigint) => Notice | Error_out;
    let error = false

    try {
      let transferNotice = await wallet.ether_transfer(
        '0x0',
        winnerAddress,
        viem.parseEther((game.bettingAmount).toString())
      );
  
      console.log(transferNotice)
    } catch (error) {
      console.log('transfering to winner error ', error)
      error = true
    }

    // for (const participant of game.participants) {
    //   if (participant.address.toLowerCase() !== winnerAddress) {

    //     console.log('inside the payment loop')
    //     console.log('betting amount ', ethers.parseEther((game.bettingAmount).toString()))

    //     try {
    //         let notice = wallet.ether_transfer(
    //           participant.address.toLowerCase(),
    //           winnerAddress,
    //           // 1000000000000000000
    //           ethers.parseEther((game.bettingAmount).toString())

    //           // ethers.parseEther('1')
    //       );
          

    //       console.log('notice ...', notice)
    //       } catch (error) {
    //         console.log("transfer ERROR");
    //         console.log(error);
    //       }

    //     }
    //   }
      if (error) {
        return errorResponse(true, 'Error transferring funds to winner')
      } else {
         game.paidOut = true
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
    commit: false,
    participants: [
      {
        move: null,
        commitment: '',
        address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
        playerInfo: {
          turn: 0,
          turnScore: 0,
          totalScore: 0
        }
      },
      {
        move: null,
        commitment: '',
        address: '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199',
        playerInfo: {
          turn: 0,
          turnScore: 0,
          totalScore: 0
        }
      },
      {
        move: null,
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

module.exports = {
  games,
  withdraw,
  addGame,
  addParticipant,
  commit,
  reveal,
  rollDice,
  playGame,
  transferToWinner
}