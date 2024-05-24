'use client'

import GameSettings from '@/components/ui/GameSettings'
import GameArena from '@/components/ui/GameArena'
import GameHeader from '@/components/shared/GameHeader'

export default function GamePage() {
  return (
    <div>
      <GameHeader />
      <GameSettings />
      <GameArena />
    </div>
  )
}
