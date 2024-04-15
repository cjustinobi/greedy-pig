const crypto = require('crypto')
const viem = require('viem')
const { ethers } = require('ethers')
const vrfAbi = require('./vrfAbi.json')

export const vrfContractAddr = '0x550411dd1c8f2a70ef278f691179490f0ace919f'

const rollupServer = process.env.ROLLUP_HTTP_SERVER_URL

const provider = new ethers.JsonRpcProvider('https://sepolia-rollup.arbitrum.io/rpc')
// Instantiate the contract

const contract = new ethers.Contract(vrfContractAddr, vrfAbi.abi, provider);

// Function to verify commitment during the reveal phase
export const verifyCommitment = async (commitment, move, nonce) => {

  console.log('verification move ', move )
  console.log('verification nonce ', nonce)
  
    const data = ethers.toUtf8Bytes(move + nonce);

    // Generate hash using SHA-256 algorithm
    const hashBytes = await crypto.subtle.digest("SHA-256", data);
    const calculatedCommitment = Array.from(new Uint8Array(hashBytes))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

        console.log('calculated commitment ', calculatedCommitment)
        console.log('actual commitment ', commitment)

    // Compare calculated commitment with the commitment received from the frontend
    return calculatedCommitment === commitment;
};

export const noticeHandler = async (data) => {
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

export const reportHandler = async (message) => {

  const result = JSON.stringify({
    error: String(message),
  });

  const hexresult = viem.stringToHex(result);

  await fetch(rollupServer + '/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      payload: hexresult,
    }),
  });
}

export const getParticipantsMove = game => {
  return game.participants.map(p => p.move !== null ? p.move : 0)
}

export const generateRollOutcome = (moves) => {

  const sum = moves.reduce((acc, curr) => acc + curr, 0);
  const rollOutcome = (sum % 6) + 1; 
  return rollOutcome;
};

export const resetMoveCommitment = game => {
  game.commitPhase = false
  game.revealPhase = false
  // reset all players move/commitment
  game.participants.forEach(p => {
    p.move = null
    p.commitment = null
  })
}

export const vrfhandler = async () => {

  const tx = await contract.requestRandomWords();
  console.log('vrf tx ', tx)
  const receipt = await tx.wait();
  console.log('vrf receipt ', receipt)

      let requestId = null;
      if (receipt.logs) {
        const decodedLogs = decodeLogs(receipt);
        for (const log of decodedLogs) {
          console.log('log ', log)
          if (log.event === 'RequestSent') {
            requestId = log.args.requestId.toString();
            break;
          }
        }
      }

        requestId

  // const call = viem.encodeFunctionData({
  //   abi: vrfAbi.abi,
  //   functionName: "requestRandomWords",
  //   args: [],
  // });

  // let voucher = {
  //   destination: vrfContractAddr,
  //   payload: call,
  // };

  // console.log(' requestRandomWords voucher', voucher);

  // return await fetch(rollupServer + "/voucher", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(voucher),
  // });

}

export const getRandomNumber = async (reqId) => {
  console.log('getrandom number reqid', reqId)
  const signer = await provider.getSigner()
  const sContract = new ethers.Contract(vrfContractAddr, vrfAbi.abi, signer);
   const tx = await sContract.getRequestStatus();
  console.log('getRandomNumber tx ', tx)
  const receipt = await tx.wait();
  console.log('getRandomNumber receipt ', receipt)
  return receipt
  // const call = viem.encodeFunctionData({
  //   abi: vrfAbi.abi,
  //   functionName: "getRequestStatus",
  //   args: [reqId],
  // });

  // let voucher = {
  //   destination: vrfContractAddr,
  //   payload: call,
  // };

  // console.log('getRandomNumber voucher ', voucher);

  // return await fetch(rollupServer + "/voucher", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(voucher),
  // });
}

export const decodeLogs = (receipt) => {
    const contractInterface = new ethers.Interface(vrfAbi.abi);
    return receipt.logs
      .map((log) => {
        try {
          return contractInterface.parseLog(log);
        } catch (error) {
          // This log was not part of the contract's interface
          return null;
        }
      })
      .filter((parsedLog) => parsedLog !== null);
  }