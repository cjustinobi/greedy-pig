import { utils } from 'ethers'

export const serverUrl =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_LOCAL_SERVER_URL
    : process.env.NEXT_PUBLIC_SERVER_URL

export const shortenAddress = (addr: string) => {
  return addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : ''
}

export const capitalize = (word: string) =>
  `${word?.substring(0, 1).toUpperCase()}${word?.substring(1)}`

export const parseInputEvent = (input: `0x${string}`) => {
  if (input) {
    const decodedString = utils.toUtf8String(input)
    return JSON.parse(JSON.parse(decodedString))
  }
}

export const generateCommitment = async (address: string) => {
  
  const randomNum = Math.floor(Math.random() * 6) + 1

  const nonce = Math.random() * 1000; // Generate a nonce
  const nonceString = nonce.toString();
  const randomString = randomNum.toString();

  // Store nonce along with commitment
  localStorage.setItem(`nonce${address.toLowerCase()}`, nonceString);
  localStorage.setItem(`move${address.toLowerCase()}`, randomString);

  const encoder = new TextEncoder();
  const data = encoder.encode(randomString + nonceString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex
};

export const hasDeposited = (bettingAmount: number, reports: any) => {
  let hasDeposited = false

  if (reports && reports.erc20[0]) {
    hasDeposited = parseInt(utils.formatEther(reports.erc20[0][1])) >= bettingAmount
  }

  return hasDeposited
}

export const getPlayerVouchers = (address: string, vouchers: any) => {

    return vouchers.map((node: any) => {

        const n = node.node;
        console.log('n ', node)
        let inputPayload = n?.input.payload;
        if (inputPayload) {
            try {
                inputPayload = utils.toUtf8String(inputPayload);
            } catch (e) {
                inputPayload = inputPayload + " (hex)";
            }
        } else {
            inputPayload = "(empty)";
        }
        let payload = n?.payload;
        const decoder = new utils.AbiCoder();
        const selector = decoder.decode(["bytes4"], payload)[0]
        payload = utils.hexDataSlice(payload,4)

        if (selector === '0xa9059cbb') {
          const decoded = decoder.decode(["address","uint256"], payload)
          const decodedAddress = decoded[0]

          if (decodedAddress.toLowerCase() === address.toLowerCase()) {
            return {
            index: parseInt(n?.index),
            payload: `${payload}`,
            input: n ? {index: n.input.index, payload: JSON.parse(inputPayload)} : {},
            proof: null,
            executed: null,
        };
          }
          return null
        }
      
    })
    .filter((node: any) => node !== null)
    .sort((b: any, a: any) => {
        if (a.input.index === b.input.index) {
            return b.index - a.index;
        } else {
            return b.input.index - a.input.index;
        }
    });
}

export const loadDiceImages = () => {
  const diceImages = []
  for (let i = 1; i <= 6; i++) {
    diceImages.push(require(`@/assets/img/dice_${i}.png`))
  }
  return diceImages
}