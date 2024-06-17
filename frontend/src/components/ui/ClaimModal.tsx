import { useRollups } from '@/hooks/useRollups'
import { VoucherService } from '@/lib/cartesi/vouchers'
import { dappAddress, getPlayerVouchers } from '@/lib/utils'
import { useConnectWallet } from '@web3-onboard/react'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { FC, useEffect, useState } from 'react'

interface IClaimModalProps {
  claimModal: boolean
  onClose: () => void
}

interface IExecuteVoucher {
  inputIndex: number
  index: number
}



const ClaimModal: FC<IClaimModalProps> = ({ claimModal, onClose }) => {

  const [playerVouchers, setPlayerVouchers] = useState<any[]>([])

  const voucherService = new VoucherService()
  const [{ wallet }] = useConnectWallet()
  const rollups = useRollups(dappAddress)

  const handleClose = () => {
    onClose()
  }

  const claim = async (index: number, inputIndex: number) => {
    try {
      const voucherWithProof = await voucherService.getVoucherWithProof(index, inputIndex)
      if (voucherWithProof) {
        await executeVoucher(voucherWithProof)
      }
    } catch (error) {
      
    }

  }

   const executeVoucher = async (voucher: any) => {
     if (rollups && !!voucher.proof) {
       const newVoucherToExecute = { ...voucher }
       try {
         const tx = await rollups.dappContract.executeVoucher(
           voucher.destination,
           voucher.payload,
           voucher.proof
         )
         const receipt = await tx.wait()
         newVoucherToExecute.msg = `voucher executed! (tx="${tx.hash}")`
         if (receipt.events) {
           newVoucherToExecute.msg = `${
             newVoucherToExecute.msg
           } - resulting events: ${JSON.stringify(receipt.events)}`
         }
         // Check execution status after transaction
         newVoucherToExecute.executed =
           await rollups.dappContract.wasVoucherExecuted(
             BigNumber.from(voucher.input.index),
             BigNumber.from(voucher.index)
           )
         setPlayerVouchers((prevVouchers) =>
           prevVouchers.map((prevVoucher) =>
             prevVoucher.index === voucher.index
               ? newVoucherToExecute
               : prevVoucher
           )
         )
       } catch (e) {
         newVoucherToExecute.msg = `COULD NOT EXECUTE VOUCHER: ${JSON.stringify(
           e
         )}`
         console.log(`COULD NOT EXECUTE VOUCHER: ${JSON.stringify(e)}`)
       }
       console.log('newVoucherToExecute ', newVoucherToExecute)
     }
   }

   useEffect(() => {
     const fetchData = async () => {
       if (wallet?.accounts[0].address) {
         const vouchers = await voucherService.getVouchers()
         if (vouchers.length) {
           const playerVouchersData = getPlayerVouchers(
             wallet?.accounts[0].address,
             vouchers
           )
           // Check execution status for initial data
           const updatedVouchers = await Promise.all(
             playerVouchersData.map(async (voucher: any) => {
               if (rollups) {
                 const isExecuted =
                   await rollups.dappContract.wasVoucherExecuted(
                     BigNumber.from(voucher.input.index),
                     BigNumber.from(voucher.index)
                   )
                 return { ...voucher, executed: isExecuted }
               } else {
                 return voucher // No rollups available, keep voucher as-is
               }
             })
           )
           setPlayerVouchers(updatedVouchers)
         }
       }
     }

     fetchData()
   }, [wallet?.accounts[0].address, rollups])

  return (
    <div
      className={`fixed ${
        claimModal ? '' : 'hidden'
      } inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal`}
    >
      <div className="mx-auto mt-10 w-[38rem] p-5 bg-gray-700 rounded-lg relative">
        {playerVouchers.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Amount</th> <th>Claim</th>
              </tr>
            </thead>
            <tbody>
              {playerVouchers.map((voucher, index) => (
                <tr key={index}>
                  <td>{voucher.input.payload.args.amount}</td>
                  <td>
                    <button
                      onClick={() => claim(voucher.index, voucher.input.index)}
                    >
                      {voucher.executed ? 'Claimed' : 'Claim'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button onClick={handleClose}>Close Modal</button>
      </div>
    </div>
  )
}

export default ClaimModal
