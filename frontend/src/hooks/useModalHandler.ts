
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { useConnectWallet } from '@web3-onboard/react'

const useModalHandler = () => {
  const dispatch = useDispatch()
  const [{ wallet }] = useConnectWallet()

  const modalHandler = () => {
    if (!wallet) return toast.error('Connect Wallet to continue')
    dispatch({ type: 'modal/toggleGameModal' })
  }

  return modalHandler
}

export default useModalHandler
