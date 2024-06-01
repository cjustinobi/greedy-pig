import { ethers } from 'ethers'

export const addInput = async (
  data: string,
  dappAddress: string,
  rollups: any
) => {
  if (rollups) {
    try {
      let payload = ethers.utils.toUtf8Bytes(data)

      const res = await rollups.inputContract.addInput(dappAddress, payload)

      console.log('res ', res)
      return res
    } catch (e) {
      console.log(`${e}`)
    }
  }
}

export const sendEther = async (address: string, gameId: string, amount: number, rollups: any) => {
  const data = ethers.utils.toUtf8Bytes(`${address} Deposited ${amount} ether from gameId: ${gameId}.`)
  const tx = { value: ethers.utils.parseEther(`${amount}`) }

  try {
    return rollups.etherPortalContract.depositEther(
      rollups.dappContract.address,
      data,
      tx
    )
  } catch (error) {
    console.log('error from sending ehther ', error)
  }
}
