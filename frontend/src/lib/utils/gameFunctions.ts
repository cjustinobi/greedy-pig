// gameFunctions.ts

import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { generateCommitment, erc20Token, hasDeposited } from '../utils';
import { inspectCall, addInput, depositErc20 } from '../cartesi';
import { dappAddress } from '@/lib/utils';
import { api } from '@/convex/_generated/api';

export const checkBalance = async (playerAddress: string, game: any, connectedChain: any) => {
  const reports = await inspectCall(`balance/${playerAddress}`, connectedChain);
  console.log('balance for: ' + playerAddress, reports);
  const res = hasDeposited(game.bettingAmount, reports[0]);

  if (res) {
    toast('Successfully deposited. You can join game!');
    return true;
  } else {
    toast(`Deposit ${game.bettingAmount} to join game`);
    return false;
  }
};

export const joinGame = async (
  wallet: any,
  game: any,
  playerAddress: string,
  updateUserAction: any,
  setDeposited: any,
  setJoining: any,
  connectedChain: any,
  rollups: any
) => {
  if (!wallet?.accounts[0].address) return toast.error('Connect account');

  if (game?.gameSettings.bet) {
    const reports = await inspectCall(`balance/${playerAddress}`, connectedChain);
    const res = hasDeposited(game.bettingAmount, reports[0]);
    if (!res) return toast.error(`You need to deposit ${game.bettingAmount} ether to join`);
    setDeposited(true);
  }

  const id = window.location.pathname.split('/').pop();
  if (!id) return toast.error('Game not found');

  setJoining(true);
  updateUserAction({ data: { userJoining: true } });

  try {
    const jsonPayload = JSON.stringify({
      method: 'addParticipant',
      data: {
        gameId: parseInt(id),
        playerAddress,
        amount: game.bettingAmount,
      },
      ...(game.gameSettings.bet && {
        args: {
          from: wallet?.accounts[0].address,
          to: dappAddress,
          erc20: erc20Token,
          amount: Number(ethers.utils.parseUnits(game.bettingAmount.toString(), 18)),
        },
      }),
    });

    const tx = await addInput(jsonPayload, dappAddress, rollups);
    const result = await tx.wait(1);

    if (result) {
      setJoining(false);
      updateUserAction({ data: { userJoining: false } });
    } else {
      updateUserAction({ data: { userJoining: false } });
    }
  } catch (error) {
    console.error('Error during game join:', error);
    setJoining(false);
    updateUserAction({ data: { userJoining: false } });
  }
};

export const rollDice = async (game: any, playerAddress: string, addInput: any, rollups: any) => {
  try {
    const jsonPayload = JSON.stringify({
      method: 'rollDice',
      data: {
        gameId: game.id,
        playerAddress: game.activePlayer,
      },
    });

    if (game.activePlayer === playerAddress) {
      const tx = await addInput(jsonPayload, dappAddress, rollups);
      const result = await tx.wait(1);
      console.log('tx for the game roll', result);
    }
  } catch (error) {
    console.error('Error during game roll:', error);
    rollDice(game, playerAddress, addInput, rollups);
  }
};

export const playGame = async (
  response: string,
  game: any,
  playerAddress: string,
  players: any,
  deposited: boolean,
  rollups: any,
  updateUserAction: any,
  setCommiting: any,
  setCommitted: any,
  setPass: any
) => {
  if (game.status === 'Ended') {
    return toast.error('Game has ended');
  }

  if (game.commitPhase || game.revealPhase) {
    return toast.error('Can\'t play game now');
  }

  if (!playerAddress) return toast.error('Connect account');
  if (players.length < 2) return toast.error('Not enough players to start');

  if (game.activePlayer !== playerAddress) {
    return toast.error('Not your turn');
  }

  if (game.gameSettings.bet && !deposited) {
    return toast.error(`Deposit ${game.bettingAmount} to continue`);
  }

  if (response === 'yes') {
    updateUserAction({ data: { userPlaying: true } });

    try {
      setCommiting(true);
      const jsonPayload = JSON.stringify({
        method: 'playGame',
        data: {
          gameId: game.id,
          playerAddress,
          response,
          commitment: await generateCommitment(playerAddress),
        },
      });

      const tx = await addInput(jsonPayload, dappAddress, rollups);
      const result = await tx.wait(1);
      if (result) {
        setCommitted(true);
        setCommiting(false);
        updateUserAction({ data: { userPlaying: false } });
      }
      console.log('tx for the game play ', result);
    } catch (error) {
      setCommiting(false);
      updateUserAction({ data: { userPlaying: false } });
      console.error('Error during game play: ', error);
    }
  } else {
    try {
      setPass(true);
      updateUserAction({ data: { userPlaying: true } });

      const jsonPayload = JSON.stringify({
        method: 'playGame',
        data: {
          gameId: game.id,
          playerAddress,
          response,
        },
      });

      const tx = await addInput(jsonPayload, dappAddress, rollups);
      const result = await tx.wait(1);
      if (result) {
        updateUserAction({ data: { userPlaying: false } });
        setPass(false);
      }
      console.log('tx for the game play ', result);
    } catch (error) {
      setPass(false);
      updateUserAction({ data: { userPlaying: false } });
      console.error('Error during game play: ', error);
    }
  }
};

export const commit = async (
  playerAddress: string,
  players: any,
  game: any,
  generateCommitment: any,
  addInput: any,
  rollups: any,
  updateUserAction: any,
  setCommiting: any,
  setCommitted: any,
  setPass: any
) => {
  if (!playerAddress) return toast.error('Connect account');

  const currentPlayer = game?.participants.find((participant: any) => participant.address === playerAddress);
  if (currentPlayer.commitment) return toast.error('Already committed');

  if (game?.activePlayer === playerAddress) return playGame('yes', game, playerAddress, players, false, rollups, updateUserAction, setCommiting, setCommitted, setPass);

  try {
    updateUserAction({ data: { userPlaying: true } });

    const jsonPayload = JSON.stringify({
      method: 'commit',
      gameId: game.id,
      commitment: await generateCommitment(playerAddress),
    });

    setCommiting(true);
    const tx = await addInput(jsonPayload, dappAddress, rollups);
    const res = await tx.wait(1);

    if (res) {
      updateUserAction({ data: { userPlaying: false } });
      setCommiting(false);
      setCommitted(true);
      toast.success('Move committed successfully!');
    }
  } catch (error) {
    console.log('error while committing ', error);
    setCommiting(false);
    updateUserAction({ data: { userPlaying: false } });
  }
};

export const reveal = async (
  playerAddress: string,
  game: any,
  players: any,
  addInput: any,
  rollups: any,
  updateUserAction: any,
  setRevealing: any,
  setRevealed: any
) => {
  if (playerAddress && !players.includes(playerAddress)) return toast.error('You are not a player');

  const currentPlayer = game?.participants.find((participant: any) => participant.address === playerAddress);
  if (currentPlayer?.move) return toast.error('Already revealed');

  updateUserAction({ data: { userPlaying: true } });

  setRevealing(true);

  const nonce = localStorage.getItem(`nonce${playerAddress}`);
  const move = localStorage.getItem(`move${playerAddress}`);

  const jsonPayload = JSON.stringify({
    method: 'reveal',
    gameId: game.id,
    move,
    nonce,
  });

  try {
    const tx = await addInput(jsonPayload, dappAddress, rollups);
    const res = await tx.wait(1);

    if (res) {
      updateUserAction({ data: { userPlaying: false } });
      setRevealing(false);
      setRevealed(true);
      toast.success('Move revealed successfully!');
    }
  } catch (error) {
    console.log('error while revealing ', error);
    setRevealing(false);
    updateUserAction({ data: { userPlaying: false } });
  }
};
