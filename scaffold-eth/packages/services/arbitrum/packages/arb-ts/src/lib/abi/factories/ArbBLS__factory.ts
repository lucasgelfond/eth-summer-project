/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from 'ethers'
import { Provider } from '@ethersproject/providers'

import type { ArbBLS } from '../ArbBLS'

export class ArbBLS__factory {
  static connect(address: string, signerOrProvider: Signer | Provider): ArbBLS {
    return new Contract(address, _abi, signerOrProvider) as ArbBLS
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'getPublicKey',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'x0',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'x1',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'y0',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'y1',
        type: 'uint256',
      },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]
