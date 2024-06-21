import { FC, useEffect, useState } from 'react'
import { utils } from 'ethers'
import { useRollups } from '@/hooks/useRollups'
import { VoucherService } from '@/lib/cartesi/vouchers'
import { dappAddress, getPlayerVouchers } from '@/lib/utils'
import { useConnectWallet } from '@web3-onboard/react'
import { BigNumber } from 'ethers'
import CloseBtn from '@/components/shared/CloseBtn'
import { addInput } from '@/lib/cartesi'
import Button from '../shared/Button'
import toast from 'react-hot-toast'

interface IWithdrawModalProps {
  withdrawModal: boolean
  onClose: () => void
  // onPaidOut: () => void
}

interface IExecuteVoucher {
  inputIndex: number
  index: number
}



const WithdrawModal: FC<IWithdrawModalProps> = ({ withdrawModal, onClose }) => {
  const [playerVouchers, setPlayerVouchers] = useState<any[]>([])
  const [withdrawing, setWithdrawing] = useState(false)
  const [executed, setExecuted] = useState(false)

  const voucherService = new VoucherService()
  const [{ wallet }] = useConnectWallet()
  const rollups = useRollups(dappAddress)

  // const paidOut = async (payload: any) => {
  //   const payloadStr = utils.toUtf8String(payload)
  //   const gameId = JSON.parse(payloadStr).gameId

  //   try {
  //     const jsonPayload = JSON.stringify({
  //       method: 'paidOut',
  //       gameId
  //     })

  //     const tx = await addInput(jsonPayload, dappAddress, rollups)
  //     const res = await tx.wait(1)

  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  const handleClose = () => {
    onClose()
  }

  const withdraw = async (index: number, inputIndex: number) => {

    const voucherExecuted = await rollups?.dappContract.wasVoucherExecuted(
      BigNumber.from(inputIndex),
      BigNumber.from(index)
    )

    if (voucherExecuted) return toast('Fund has been withrawn')

    setWithdrawing(true)

    try {
      const voucherWithProof = await voucherService.getVoucherWithProof(
        index,
        inputIndex
      )
      if (voucherWithProof) {
        await executeVoucher(voucherWithProof)
      }
    } catch (error) {
      setWithdrawing(false)
    }
  }

  const executeVoucher = async (voucher: any) => {
    if (rollups && !!voucher.proof) {

      try {
        const tx = await rollups.dappContract.executeVoucher(
          voucher.destination,
          voucher.payload,
          voucher.proof
        )
        const receipt = await tx.wait()

        if (receipt.events) {
          console.log('voucher receipt ', receipt)

          toast.success('Congratulation! Fund successfully withdrawn')
          handleClose()

        }
    
        setWithdrawing(false)
      } catch (e) {
   
        console.log(`COULD NOT EXECUTE VOUCHER: ${JSON.stringify(e)}`)
        setWithdrawing(false)
        handleClose()
        toast.error('Fund not withrawn')
      }
    
      setExecuted(true)
      setWithdrawing(false)
    }
  }

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
              const isExecuted = await rollups.dappContract.wasVoucherExecuted(
                BigNumber.from(voucher.input.index),
                BigNumber.from(voucher.index)
              )
              return { ...voucher, executed: isExecuted }
            } else {
              return voucher
            }
          })
        )
        console.log('players vouchers ', updatedVouchers)
        setPlayerVouchers(updatedVouchers)
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [wallet?.accounts[0].address, rollups])

  useEffect(() => {
    if (withdrawModal) {
      fetchData()
    }
  }, [withdrawModal])

  return (
    <div
      className={`fixed ${
        withdrawModal ? '' : 'hidden'
      } inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal`}
    >
      <div className="mx-auto mt-10 w-[28rem] text-xl text-blue-200 p-5 bg-gray-700 rounded-lg relative">
        {playerVouchers.length &&
          playerVouchers.every((voucher) => voucher.executed) && (
            <div className="text-center">
              <p>All caught up</p>
              <span>Nothing to withdraw</span>
            </div>
          )}
        {!executed && playerVouchers.length > 0 && (
          <table>
            <thead>
              <tr>{/* <th>Amount</th> <th>Withdraw</th> */}</tr>
            </thead>
            <tbody>
              {playerVouchers
                .filter((voucher) => voucher.executed !== true)
                .map((voucher, index) => (
                  <tr key={index}>
                    <td className="pr-10">
                      {voucher.input.payload.args?.amount
                        ? utils
                            .formatEther(
                              voucher.input.payload.args.amount.toString()
                            )
                            .toString()
                        : '0'}
                    </td>
                    <td>
                      <Button
                        disabled={voucher.executed || withdrawing}
                        onClick={() =>
                          withdraw(voucher.index, voucher.input.index)
                        }
                      >
                        {voucher.executed
                          ? 'Withdrawn'
                          : withdrawing
                          ? 'Withdrawing...'
                          : 'Withdraw'}
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
        {executed ||
          (!playerVouchers.length && (
            <div className="text-center">
              <p>All caught up</p>
              <span>Nothing to withdraw</span>
            </div>
          ))}
        <CloseBtn handleClose={handleClose} />
      </div>
    </div>
  )
}

export default WithdrawModal
