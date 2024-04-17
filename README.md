Greedy Pig is an engaging and interactive dice game, it is tailored for events and showcasing the utilization of Cartesi technology for off-chain logic. By blending entertainment with cutting-edge technology, the game enhances event experiences and offers participants the chance to win prizes based on their gameplay prowess.

**Key Features:**

1. **Flexibility:** Greedy Pig is designed to be adaptable, offering multiple options such as using either a roulette or a dice as the item of play, determining game end conditions (e.g., reaching a specific score or number of turns), and optionally including a moderator to manage game flow.
2. **Player Dynamics:** The game supports two or more players, fostering a lively and competitive environment.
3. **Gameplay Mechanics:**
    - Players roll a six-sided die to accumulate points.
    - Rolling a one ends the player's turn, resulting in the loss of all accumulated points for that turn.
    - Players have the option to either keep their score and pass the die or continue rolling to potentially increase their score, risking losing it all if they roll a one.
4. **Scoring & Strategy:** Success hinges on strategic decision-making, balancing risk and reward to maximize point accumulation without succumbing to greed.
- GreedyPig uses Commit-Reveal scheme mechanism for the dice roll outcome.
- The first player to join a game starts the game, thereby being the first to commit while other players follow suit. This entails they are involved on the outcome of the current player's roll. 
- After the commit phase, game participants are notified of the Reveal phase. What they reveal, determines the dice roll outcome.
The dice rolls immediately once all players have revealed their individual numbers.
5. **Game Conclusion & Rewards:** The game ends either when the agreed-upon number of turns is reached or when a player achieves the target score. The winner, determined by the highest score, receives the accumulated prize pool.

### Deployment

- Deployed to Sepolia testnet
- The dApp is Self-hosted using [fly.io](https://fly.io)
- The Frontend is hosted on [greedypig.vercel.app](https://greedypig.vercel.app)

### Quick steps on how to Create and Play Greedy Pig

- Ensure you have some Sepolia tokens in your wallet for signing transactions

- Create Game
  - Enter game title
  - Enter winning score
  - Stake mode (default is `free`)
  - Game Apparatue (default is `dice`)
  - Mode (default is `score-based`)


### What Next?

- Revamp the UI to have more game texture
- Activate use of Roulette
- Implement Turn-based mode
- Stake for game
- Explore Account Abstraction to improve game experience and adoption