import { utils } from 'ethers'

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
  const hasDeposited = (reports && reports.erc20[0] && parseInt(utils.formatEther(reports.erc20[0][1]))) >= bettingAmount

  return !!hasDeposited
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

// (2) [{…}, {…}]
// 0
// : 
// cursor
// : 
// "MA=="
// node
// : 
// index
// : 
// 0
// input
// : 
// {index: 10, payload: '0x7b226d6574686f64223a2265726332305f77697468647261…439466630623539316532222c22616d6f756e74223a347d7d'}
// payload
// : 
// "0xa9059cbb000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000004"
// proof
// : 
// context
// : 
// "0x0000000000000000000000000000000000000000000000000000000000000007"
// [[Prototype]]
// : 
// Object
// [[Prototype]]
// : 
// Object
// [[Prototype]]
// : 
// Object
// 1
// : 
// cursor
// : 
// "MQ=="
// node
// : 
// index
// : 
// 0
// input
// : 
// {index: 11, payload: '0x7b226d6574686f64223a2265726332305f77697468647261…439466630623539316532222c22616d6f756e74223a347d7d'}
// payload
// : 
// "0xa9059cbb000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000004"
// proof
// : 
// {context: '0x0000000000000000000000000000000000000000000000000000000000000008'}
// [[Prototype]]
// : 
// Object
// [[Prototype]]
// : 
// Object
// length
// : 
// 2