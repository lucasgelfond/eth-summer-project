/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from 'ethers'
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from '@ethersproject/contracts'
import { BytesLike } from '@ethersproject/bytes'
import { Listener, Provider } from '@ethersproject/providers'
import { FunctionFragment, EventFragment, Result } from '@ethersproject/abi'

interface ArbFunctionTableInterface extends ethers.utils.Interface {
  functions: {
    'get(address,uint256)': FunctionFragment
    'size(address)': FunctionFragment
    'upload(bytes)': FunctionFragment
  }

  encodeFunctionData(
    functionFragment: 'get',
    values: [string, BigNumberish]
  ): string
  encodeFunctionData(functionFragment: 'size', values: [string]): string
  encodeFunctionData(functionFragment: 'upload', values: [BytesLike]): string

  decodeFunctionResult(functionFragment: 'get', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'size', data: BytesLike): Result
  decodeFunctionResult(functionFragment: 'upload', data: BytesLike): Result

  events: {}
}

export class ArbFunctionTable extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this
  attach(addressOrName: string): this
  deployed(): Promise<this>

  on(event: EventFilter | string, listener: Listener): this
  once(event: EventFilter | string, listener: Listener): this
  addListener(eventName: EventFilter | string, listener: Listener): this
  removeAllListeners(eventName: EventFilter | string): this
  removeListener(eventName: any, listener: Listener): this

  interface: ArbFunctionTableInterface

  functions: {
    get(
      addr: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, boolean, BigNumber]>

    'get(address,uint256)'(
      addr: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, boolean, BigNumber]>

    size(addr: string, overrides?: CallOverrides): Promise<[BigNumber]>

    'size(address)'(
      addr: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>

    upload(buf: BytesLike, overrides?: Overrides): Promise<ContractTransaction>

    'upload(bytes)'(
      buf: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>
  }

  get(
    addr: string,
    index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<[BigNumber, boolean, BigNumber]>

  'get(address,uint256)'(
    addr: string,
    index: BigNumberish,
    overrides?: CallOverrides
  ): Promise<[BigNumber, boolean, BigNumber]>

  size(addr: string, overrides?: CallOverrides): Promise<BigNumber>

  'size(address)'(addr: string, overrides?: CallOverrides): Promise<BigNumber>

  upload(buf: BytesLike, overrides?: Overrides): Promise<ContractTransaction>

  'upload(bytes)'(
    buf: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>

  callStatic: {
    get(
      addr: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, boolean, BigNumber]>

    'get(address,uint256)'(
      addr: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, boolean, BigNumber]>

    size(addr: string, overrides?: CallOverrides): Promise<BigNumber>

    'size(address)'(addr: string, overrides?: CallOverrides): Promise<BigNumber>

    upload(buf: BytesLike, overrides?: CallOverrides): Promise<void>

    'upload(bytes)'(buf: BytesLike, overrides?: CallOverrides): Promise<void>
  }

  filters: {}

  estimateGas: {
    get(
      addr: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    'get(address,uint256)'(
      addr: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>

    size(addr: string, overrides?: CallOverrides): Promise<BigNumber>

    'size(address)'(addr: string, overrides?: CallOverrides): Promise<BigNumber>

    upload(buf: BytesLike, overrides?: Overrides): Promise<BigNumber>

    'upload(bytes)'(buf: BytesLike, overrides?: Overrides): Promise<BigNumber>
  }

  populateTransaction: {
    get(
      addr: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    'get(address,uint256)'(
      addr: string,
      index: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    size(addr: string, overrides?: CallOverrides): Promise<PopulatedTransaction>

    'size(address)'(
      addr: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>

    upload(buf: BytesLike, overrides?: Overrides): Promise<PopulatedTransaction>

    'upload(bytes)'(
      buf: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>
  }
}
