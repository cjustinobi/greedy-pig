'use client'

import Hero from '@/components/ui/Hero'

import Header from '@/components/shared/Header'
import Features from '@/components/ui/Features'
import Stats from '@/components/ui/Stats'
import CreateGameModal from '@/components/ui/CreateGameModal'
import Games from '@/components/ui/Games'
import Test from '@/components/ui/Test'
import Dice from '@/components/ui/Dice'

export default function Home() {
  return (
    <div className="md:px-custom p-custom-sm text-gray-500">
      <Header />
      <Dice />
      <Test />
      <Hero />
      <Stats />
      <Games />
      <Features />
      <CreateGameModal />
    </div>
  )
}