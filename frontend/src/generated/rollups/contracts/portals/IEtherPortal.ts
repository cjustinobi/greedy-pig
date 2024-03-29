/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from 'ethers'
import type { FunctionFragment, Result } from '@ethersproject/abi'
import type { Listener, Provider } from '@ethersproject/providers'
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from '../../common'

export interface IEtherPortalInterface extends utils.Interface {
  functions: {
    'depositEther(address,bytes)': FunctionFragment
    'getInputBox()': FunctionFragment
  }

  getFunction(
    nameOrSignatureOrTopic: 'depositEther' | 'getInputBox'
  ): FunctionFragment

  encodeFunctionData(
    functionFragment: 'depositEther',
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string
  encodeFunctionData(
    functionFragment: 'getInputBox',
    values?: undefined
  ): string

  decodeFunctionResult(
    functionFragment: 'depositEther',
    data: BytesLike
  ): Result
  decodeFunctionResult(functionFragment: 'getInputBox', data: BytesLike): Result

  events: {}
}

export interface IEtherPortal extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this
  attach(addressOrName: string): this
  deployed(): Promise<this>

  interface: IEtherPortalInterface

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>
  listeners(eventName?: string): Array<Listener>
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this
  removeAllListeners(eventName?: string): this
  off: OnEvent<this>
  on: OnEvent<this>
  once: OnEvent<this>
  removeListener: OnEvent<this>

  functions: {
    /**
     * All the value sent through this function is forwarded to the DApp.      If the transfer fails, `EtherTransferFailed` error is raised.
     * Transfer Ether to a DApp and add an input to the DApp's input box to signal such operation. All the value sent through this function is forwarded to the DApp.
     * @param _dapp The address of the DApp
     * @param _execLayerData Additional data to be interpreted by the execution layer
     */
    depositEther(
      _dapp: PromiseOrValue<string>,
      _execLayerData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>

    /**
     * Get the input box used by this input relay.
     */
    getInputBox(overrides?: CallOverrides): Promise<[string]>
  }

  /**
   * All the value sent through this function is forwarded to the DApp.      If the transfer fails, `EtherTransferFailed` error is raised.
   * Transfer Ether to a DApp and add an input to the DApp's input box to signal such operation. All the value sent through this function is forwarded to the DApp.
   * @param _dapp The address of the DApp
   * @param _execLayerData Additional data to be interpreted by the execution layer
   */
  depositEther(
    _dapp: PromiseOrValue<string>,
    _execLayerData: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>

  /**
   * Get the input box used by this input relay.
   */
  getInputBox(overrides?: CallOverrides): Promise<string>

  callStatic: {
    /**
     * All the value sent through this function is forwarded to the DApp.      If the transfer fails, `EtherTransferFailed` error is raised.
     * Transfer Ether to a DApp and add an input to the DApp's input box to signal such operation. All the value sent through this function is forwarded to the DApp.
     * @param _dapp The address of the DApp
     * @param _execLayerData Additional data to be interpreted by the execution layer
     */
    depositEther(
      _dapp: PromiseOrValue<string>,
      _execLayerData: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>

    /**
     * Get the input box used by this input relay.
     */
    getInputBox(overrides?: CallOverrides): Promise<string>
  }

  filters: {}

  estimateGas: {
    /**
     * All the value sent through this function is forwarded to the DApp.      If the transfer fails, `EtherTransferFailed` error is raised.
     * Transfer Ether to a DApp and add an input to the DApp's input box to signal such operation. All the value sent through this function is forwarded to the DApp.
     * @param _dapp The address of the DApp
     * @param _execLayerData Additional data to be interpreted by the execution layer
     */
    depositEther(
      _dapp: PromiseOrValue<string>,
      _execLayerData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>

    /**
     * Get the input box used by this input relay.
     */
    getInputBox(overrides?: CallOverrides): Promise<BigNumber>
  }

  populateTransaction: {
    /**
     * All the value sent through this function is forwarded to the DApp.      If the transfer fails, `EtherTransferFailed` error is raised.
     * Transfer Ether to a DApp and add an input to the DApp's input box to signal such operation. All the value sent through this function is forwarded to the DApp.
     * @param _dapp The address of the DApp
     * @param _execLayerData Additional data to be interpreted by the execution layer
     */
    depositEther(
      _dapp: PromiseOrValue<string>,
      _execLayerData: PromiseOrValue<BytesLike>,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>

    /**
     * Get the input box used by this input relay.
     */
    getInputBox(overrides?: CallOverrides): Promise<PopulatedTransaction>
  }
}
