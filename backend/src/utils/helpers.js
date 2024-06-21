const crypto = require('crypto')
const viem = require('viem')
const { ethers } = require('ethers')

const rollupServer = process.env.ROLLUP_HTTP_SERVER_URL

// Function to verify commitment during the reveal phase
const verifyCommitment = async (commitment, move, nonce) => {

  console.log('verification move ', move )
  console.log('verification nonce ', nonce)
  
    const data = ethers.toUtf8Bytes(move + nonce);

    // Generate hash using SHA-256 algorithm
    const hashBytes = await crypto.subtle.digest("SHA-256", data);
    const calculatedCommitment = Array.from(new Uint8Array(hashBytes))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

    

    // Compare calculated commitment with the commitment received from the frontend
    return calculatedCommitment === commitment;
};

const noticeHandler = async (data) => {
  const result = JSON.stringify(data)
  const hexresult = viem.stringToHex(result)

  return await fetch(rollupServer + '/notice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ payload: hexresult })
  });
}


const getParticipantsMove = game => {
  return game.participants.map(p => p.move !== null ? p.move : 0)
}

const generateRollOutcome = (moves) => {

  const sum = moves.reduce((acc, curr) => acc + curr, 0);
  const rollOutcome = (sum % 6) + 1; 
  return rollOutcome;
};

const resetMoveCommitment = game => {
  game.commitPhase = false
  game.revealPhase = false
  // reset all players move/commitment
  game.participants.forEach(p => {
    p.move = null
    p.commitment = null
  })
}

const transferAmountEqual = (amount, incomingAmount) => {
  return Number(ethers.parseUnits(amount.toString(), 18)) === incomingAmount
}


module.exports = { 
  verifyCommitment, 
  noticeHandler, 
  getParticipantsMove, 
  generateRollOutcome, 
  resetMoveCommitment,
  transferAmountEqual
}