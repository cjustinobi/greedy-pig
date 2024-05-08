'use client'

import Hero from '@/components/ui/Hero'

import Header from '@/components/shared/Header'
import Features from '@/components/ui/Features'
import Stats from '@/components/ui/Stats'
import Games from '@/components/ui/Games'
import { addInput } from '@/lib/cartesi'
import { useRollups } from '@/hooks/useRollups'
import { dappAddress } from '@/lib/utils'

export default function Home() {
    // const rollups = useRollups(dappAddress)
    // const test = async () => {
    //   try {
    //     const jsonPayload = JSON.stringify({
    //       method: 'test',
    //     })

    //     const tx = await addInput(
    //       JSON.stringify(jsonPayload),
    //       dappAddress,
    //       rollups
    //     )

    //     const result = await tx.wait(1)
    //     console.log('tx for the game ', result)
    //   } catch (error) {
    //     console.error('Error during game:', error)
    //   }
    // }
  return (
    <div className="md:px-custom p-custom-sm text-gray-500">
      <Header />
      {/* <button onClick={test}>Test</button> */}
      <Hero />
      <Stats />
      <Games />
      <Features />
    </div>
  )
}
