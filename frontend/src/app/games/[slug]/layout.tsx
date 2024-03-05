'use client'

import Link from 'next/link'
import Image from 'next/image'
import * as Ably from 'ably'
import {
  AblyProvider,
  useChannel,
  useConnectionStateListener,
} from 'ably/react'
import Logo from '@/assets/img/logo.png'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const client = new Ably.Realtime.Promise({ key: process.env.NEXT_PUBLIC_ABLY_KEY! as string });

  return (
    <section className={`h-screen game-bg`}>
      <div className="md:px-custom p-custom-sm text-gray-500">
        {/* <Link
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
        </Link> */}
        {/* <AblyProvider client={client}> */}
        {children}
        {/* </AblyProvider> */}
      </div>
    </section>
  )
}
