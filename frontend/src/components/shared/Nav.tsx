import Link from "next/link"

const Nav = () => {
  return (
    <nav className="hidden gap-12 lg:flex">
      <Link
        href="/games"
        className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700"
      >
        Games
      </Link>
      {/* <Link
        onClick={modalHandler}
        href="#"
        className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700"
      >
        Create Game
      </Link> */}
      <Link
        href="/how-to-play"
        className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700"
      >
        How to Play
      </Link>
    </nav>
  )
}

export default Nav