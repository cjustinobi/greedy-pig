import { FC } from "react"

interface ICloseBtnProps {
  handleClose: () => void
}

const CloseBtn: FC<ICloseBtnProps> = ({ handleClose }) => {
  return (
    <button
      onClick={() => handleClose()}
      type="button"
      className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none absolute top-2 right-6 z-50"
      data-te-modal-dismiss
      aria-label="Close"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  )
}

export default CloseBtn