/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type {
  IDAppAddressRelay,
  IDAppAddressRelayInterface,
} from '../../../contracts/relays/IDAppAddressRelay'

const _abi = [
  {
    inputs: [],
    name: 'getInputBox',
    outputs: [
      {
        internalType: 'contract IInputBox',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_dapp',
        type: 'address',
      },
    ],
    name: 'relayDAppAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export class IDAppAddressRelay__factory {
  static readonly abi = _abi
  static createInterface(): IDAppAddressRelayInterface {
    return new utils.Interface(_abi) as IDAppAddressRelayInterface
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IDAppAddressRelay {
    return new Contract(address, _abi, signerOrProvider) as IDAppAddressRelay
  }
}
