import React from 'react'
import Image from 'next/image'
import GreedyStart from '@/assets/img/greedypig2.jpg'
import { BackgroundGradient } from './cardgradient'

export default function BackgroundGradientDemo() {
  const items = [
    {
      src: GreedyStart,
      title: 'Free to play games',
      description:
        'Each turn, a player repeatedly rolls a die until either a 1 is rolled or the player decides to pass',
    },
    {
      src: GreedyStart,
      title: 'Buy to play games',
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam, est ad odio neque quam quidem sint,iusto.',
    },
    {
      src: GreedyStart,
      title: 'Pay to play games',
      description:
        "If the player rolls any other number, it is added to their turn total and the player's turn continues.",
    },
  ]

  return (
    <div className="">
      <h1 className="text-center py-9 text-[22px] font-bold">How to Play</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <BackgroundGradient
            key={index}
            className="rounded-[33px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900"
          >
            <div>
              <Image
                src={item.src}
                alt="greedy image"
                width={500}
                height={500}
                className="object-contain"
              />
              <p className="text-base sm:text-2xl font-bold text-black mt-4 mb-2 dark:text-neutral-200">
                {item.title}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {item.description}
              </p>
            </div>
          </BackgroundGradient>
        ))}
      </div>
    </div>
  )
}
