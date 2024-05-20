'use client'

import ConvexClientProvider from '@/components/providers/ConvexClientProvider'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <section className={`h-screen game-bg`}>
      <div className="md:px-custom p-custom-sm text-gray-500">
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </div>
    </section>
  )
}
