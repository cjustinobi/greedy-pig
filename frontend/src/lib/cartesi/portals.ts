import { ethers } from 'ethers'

export const addInput = async (
  data: string,
  dappAddress: string,
  rollups: any
) => {
  if (rollups) {
    try {
      let payload = ethers.utils.toUtf8Bytes(data)

      return await rollups.inputContract.addInput(dappAddress, payload)
    } catch (e) {
      console.log(`${e}`)
    }
  }
}

export const sendEther = async (
  amount: number,
  rollups: any) => {
  const data = ethers.utils.toUtf8Bytes(`Deposited (${amount}) ether.`);
  const tx = {value: ethers.utils.parseEther(`${amount}`)}

  console.log("Ether to deposit: ", tx);

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
