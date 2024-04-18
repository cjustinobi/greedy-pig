'use client'

import Header from '@/components/shared/Header'

const HowToPlay = () => {
  return (
    <div className="md:px-custom p-custom-sm text-gray-500">
      <Header />
      <h1 className="font-bold text-center">How to Play the game</h1>
      <ol className="w-[80%] md:w-[60%] mx-auto mt-24 border-s-2 border-primary dark:border-primary-500">
        <li>
          <div className="flex-start flex items-center">
            <div className="-ms-[9px] -mt-2 me-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary dark:bg-primary-500"></div>
            <h4 className="-mt-2 text-xl font-semibold">Join the game</h4>
          </div>
          <div className="mb-6 ms-6 pb-6">
            <p className="mb-4 mt-2">
              Click the "Join Game" button and sign the transaction on the
              wallet pop-up. Wait for other players to join. A minimum of 2
              players is required.
            </p>
          </div>
        </li>

        <li>
          <div className="flex-start flex items-center">
            <div className="-ms-[9px] -mt-2 me-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary dark:bg-primary-500"></div>
            <h4 className="-mt-2 text-xl font-semibold">Commit Phase</h4>
          </div>
          <div className="mb-6 ms-6 pb-6">
            <p className="mb-4 mt-2">
              The first player commits first, followed by the rest of the
              players. Each player's commitment is crucial for determining the
              outcome of the current player's roll.
            </p>
          </div>
        </li>

        <li>
          <div className="flex-start flex items-center">
            <div className="-ms-[9px] -mt-2 me-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary dark:bg-primary-500"></div>
            <h4 className="-mt-2 text-xl font-semibold">Reveal Phase</h4>
          </div>
          <div className="mb-6 ms-6 pb-6">
            <p className="mb-4 mt-2">
              After all players have committed, they reveal their individual
              numbers. These revealed numbers determine the dice roll outcome
              for the active player.
            </p>
          </div>
        </li>
        <li>
          <div className="flex-start flex items-center">
            <div className="-ms-[9px] -mt-2 me-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary dark:bg-primary-500"></div>
            <h4 className="-mt-2 text-xl font-semibold">
              Dice Roll and Leaderboard Update
            </h4>
          </div>
          <div className="mb-6 ms-6 pb-6">
            <p className="mb-4 mt-2">
              The dice rolls immediately after the reveal phase. The leaderboard
              is updated with the latest scores.
            </p>
          </div>
        </li>
        <li>
          <div className="flex-start flex items-center">
            <div className="-ms-[9px] -mt-2 me-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary dark:bg-primary-500"></div>
            <h4 className="-mt-2 text-xl font-semibold">Next Player's Turn</h4>
          </div>
          <div className="mb-6 ms-6 pb-6">
            <p className="mb-4 mt-2">
              If the roll outcome was 1, the next player in the leaderboard
              becomes the active player. Otherwise, the current active player
              rolls again or skips the turn based on their strategy.
            </p>
          </div>
        </li>
        <li>
          <div className="flex-start flex items-center">
            <div className="-ms-[9px] -mt-2 me-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary dark:bg-primary-500"></div>
            <h4 className="-mt-2 text-xl font-semibold">Game Continues</h4>
          </div>
          <div className="mb-6 ms-6 pb-6">
            <p className="mb-4 mt-2">
              Repeat steps 2-5 until there is a winner. The game ends when a
              player achieves the target score (in score-based mode) or when all
              players have completed their turns (in turn-based mode).
            </p>
          </div>
        </li>
      </ol>
    </div>
  )
}

export default HowToPlay