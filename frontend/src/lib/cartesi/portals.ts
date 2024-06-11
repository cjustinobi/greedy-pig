import { ethers } from 'ethers'
import { IERC20__factory } from '../../generated/rollups'

export const addInput = async (
  data: string,
  dappAddress: string,
  rollups: any
) => {
  if (rollups) {
    console.log(data)
    try {
      let payload = ethers.utils.toUtf8Bytes(data)

      const res = await rollups.inputContract.addInput(dappAddress, payload)

      console.log('res ', res)
      return res
    } catch (e) {
      console.log(`${JSON.stringify(e)}`)
    }
  }
}

export const depositErc20 = async (token: string, amount: number, rollups: any, provider: any) => {
  try {
    if (rollups && provider) {

      const data = ethers.utils.toUtf8Bytes(
        `Deposited (${amount}) of ERC20 (${token}).`
      );
      //const data = `Deposited ${args.amount} tokens (${args.token}) for DAppERC20Portal(${portalAddress}) (signer: ${address})`;
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress()
      
      const erc20PortalAddress = rollups.erc20PortalContract.address;
      const tokenContract = signer
      ? IERC20__factory.connect(token, signer)
      : IERC20__factory.connect(token, provider);
      
      // query current allowance
      const currentAllowance = await tokenContract.allowance(
        signerAddress.toLowerCase(),
        erc20PortalAddress.toLowerCase()
        );
   
      // if (true) {
      if (ethers.utils.parseEther(`${amount}`) > currentAllowance) {

        console.log('amount ', ethers.utils.parseEther(`${amount}`))
        // Allow portal to withdraw `amount` tokens from signer
        try {
          const tx = await tokenContract.approve(
            erc20PortalAddress,
            ethers.utils.parseEther(`${amount}`)
          );
          const receipt = await tx.wait(1);
        const event = (
          await tokenContract.queryFilter(
            tokenContract.filters.Approval(),
            receipt.blockHash
          )
        ).pop();
        if (!event) {
          throw Error(
            `could not approve ${amount} tokens for DAppERC20Portal(${erc20PortalAddress})  (signer: ${signerAddress}, tx: ${tx.hash})`
          );
        }
        } catch (error) {
          console.log('error from transgfering ', error)
        }
      
      }

      return await rollups.erc20PortalContract.depositERC20Tokens(
        token,
        rollups.dappContract.address,
        ethers.utils.parseEther(`${amount}`),
        data
      );
    }
  } catch (e) {
    console.log(`${e}`);
  }
};

export const sendEther = async (address: string, gameId: string, amount: any, rollups: any) => {
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
