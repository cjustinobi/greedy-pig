import Image from 'next/image'
import Link from 'next/link'
import Logo from '@/assets/img/logo.png'
import ConnectButton from '@/components/ui/ConnectButton'
import Drawer from '../ui/Drawer'
import { navLinks } from '@/lib/utils'
import useModalHandler from '@/hooks/useModalHandler'

const Header = () => {

  const modalHandler = useModalHandler()

  const updatedLinks = navLinks.map((link) =>
    link.text === 'Create Game' ? { ...link, onClick: modalHandler } : link
  )

  return (
    <div className="mx-auto max-w-screen-2xl">
      <header className="flex items-center justify-between py-4 md:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-2xl font-bold md:text-3xl"
          aria-label="logo"
        >
          <Image
            className=""
            data-aos="zoom-in"
            src={Logo}
            alt="greedy image"
            width={70}
            height={50}
            loading="lazy"
          />
          GreedyPig
        </Link>

        <nav className="hidden gap-12 lg:flex">
          {updatedLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              onClick={link.onClick}
              className="text-lg font-semibold text-gray-600 transition duration-100 hover:text-indigo-500 active:text-indigo-700"
            >
              {link.text}
            </Link>
          ))}
     
        </nav>
        <div className="-ml-8 hidden flex-col gap-2.5 sm:flex-row sm:justify-center lg:flex lg:justify-start">
          <div className="flex items-center gap-8">
            <ConnectButton />
          </div>
        </div>

        <Drawer />

      </header>
    </div>
  )
}

export default Header
