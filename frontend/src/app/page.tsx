'use client'

import Hero from '@/components/ui/Hero'

import Header from '@/components/shared/Header'
import Features from '@/components/ui/Features'
import Stats from '@/components/ui/Stats'
import CreateGameModal from '@/components/ui/CreateGameModal'
import Games from '@/components/ui/Games'
import BackgroundGradientDemo from '@/components/ui/background-demo'

export default function Home() {
  return (
    <div className="md:px-custom p-custom-sm text-gray-500">
      <Header />
      <Hero />
      <Stats />
      <BackgroundGradientDemo />
      <Games />
      <Features />
      <CreateGameModal />      
    </div>
  )
}
