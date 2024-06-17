import { VoucherService } from '@/lib/cartesi/vouchers'
import { getPlayerVouchers } from '@/lib/utils'
import { useConnectWallet } from '@web3-onboard/react'
import { FC, useEffect } from 'react'

interface ClaimModalProps {
  claimModal: boolean
  onClose: () => void
}

const ClaimModal: FC<ClaimModalProps> = ({ claimModal, onClose }) => {
  const voucherService = new VoucherService()
  const [{ wallet }] = useConnectWallet()

  const handleClose = () => {
    onClose() // Call the prop function to reset claimModal in parent
  }

  useEffect(() => {
    const fetchData = async () => {
      if (wallet?.accounts[0].address) {
        const vouchers = await voucherService.getVouchers()
        if (vouchers.length) {
          const playerVouchers = getPlayerVouchers(
            wallet?.accounts[0].address,
            vouchers
          )
          console.log('playerVouchers ', playerVouchers)
        }
      }
    }

    fetchData()
  }, [wallet?.accounts[0].address])

  return (
    <div
      className={`fixed ${
        claimModal ? '' : 'hidden'
      } inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal`}
    >
      <div className="mx-auto mt-10 w-[38rem] p-5 bg-gray-700 rounded-lg relative">
        <h1>Claim Modal</h1>
        <button onClick={handleClose}>Close Modal</button>
      </div>
    </div>
  )
}

export default ClaimModal
