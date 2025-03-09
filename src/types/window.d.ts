import type { Keplr } from '@keplr-wallet/types';
import type {
  SuiSignAndExecuteTransactionBlockInput,
  SuiSignAndExecuteTransactionInput,
  SuiSignMessageInput,
  SuiSignPersonalMessageInput,
  SuiSignTransactionBlockInput,
  SuiSignTransactionInput,
} from '@mysten/wallet-standard';

import type { Network } from '@/constants/bitcoin/common';
import type { ApprovedSuiPermissionType } from '@/types/extension';
import type { AptosListenerType, BitcoinListenerType, EthereumListenerType, SuiListenerType } from '@/types/message';
import type { BaseRequest, CommonRequest, Request, Response } from '@/types/message/inject';
import type {
  AptosAccountResponse,
  AptosConnectResponse,
  AptosDisconnectResponse,
  AptosIsConnectedResponse,
  AptosNetworkResponse,
  AptosSignAndSubmitTransactionResponse,
  AptosSignMessage,
  AptosSignMessageResponse,
  AptosSignPayload,
  AptosSignTransactionResponse,
} from '@/types/message/inject/aptos';
import type {
  BitGetAddressResponse,
  BitGetBalanceResponse,
  BitRequestAccountResponse,
  BitSendBitcoinResponse,
  BitSignPsbtResposne,
  BitSignPsbtsResposne,
  BitSignPsbtsResposne,
} from '@/types/message/inject/bitcoin';
import type { CommonRequest } from '@/types/message/inject/common';
import type {
  SuiRequestDisconnectResponse,
  SuiSignAndExecuteTransactionBlockResponse,
  SuiSignAndExecuteTransactionResponse,
  SuiSignMessageResponse,
  SuiSignPersonalMessageResponse,
  SuiSignTransactionBlockResponse,
  SuiSignTransactionResponse,
} from '@/types/message/inject/sui';

declare global {
  type KeplrInterface = Omit<
    Keplr,
    | 'enigmaEncrypt'
    | 'enigmaDecrypt'
    | 'getEnigmaTxEncryptionKey'
    | 'getEnigmaPubKey'
    | 'getEnigmaUtils'
    | 'getSecret20ViewingKey'
    | 'signEthereum'
    | 'disable'
    | 'getKeysSettled'
    | 'signICNSAdr36'
    | 'experimentalSignEIP712CosmosTx_v0'
    | 'getChainInfosWithoutEndpoints'
    | 'changeKeyRingName'
    | 'sendEthereumTx'
    | 'suggestERC20'
    | 'getStarknetKey'
    | 'getStarknetKeysSettled'
    | 'signStarknetDeployAccountTransaction'
    | 'signStarknetTx'
    | 'ping'
    | 'signDirectAux'
    | 'getChainInfoWithoutEndpoints'
    | 'ethereum'
    | 'starknet'
  >;
  interface CommonProvider {
    request: (message: CommonRequest) => Promise<Unknown>;
  }

  interface CosmosProvider {
    request: <T extends BaseRequest>(message: T) => Promise<Unknown>;
    // on: (eventName: import('@/types/').CosmosListenerType, eventHandler: (event?: unknown) => void) => void;
    // off: (
    //   eventName: import('~/types/message').CosmosListenerType | ((event: MessageEvent<ListenerMessage>) => void),
    //   eventHandler?: (data: unknown) => void,
    // ) => void;
  }

  interface SuiProvider {
    request: <T extends BaseRequest>(message: T) => Promise<Unknown>;
    connect: (permissions: ApprovedSuiPermissionType[]) => Promise<boolean>;
    disconnect: () => Promise<SuiRequestDisconnectResponse>;
    requestPermissions: (permissions?: ApprovedSuiPermissionType[]) => Promise<boolean>;
    hasPermissions: (permissions?: ApprovedSuiPermissionType[]) => Promise<boolean>;
    getAccounts: () => Promise<string[]>;
    getPublicKey: () => Promise<string>;
    getChain: () => Promise<string>;
    signTransactionBlock: (data: SuiSignTransactionBlockInput) => Promise<SuiSignTransactionBlockResponse>;
    signTransaction: (data: SuiSignTransactionInput) => Promise<SuiSignTransactionResponse>;
    signAndExecuteTransactionBlock: (data: SuiSignAndExecuteTransactionBlockInput) => Promise<SuiSignAndExecuteTransactionBlockResponse>;
    signAndExecuteTransaction: (data: SuiSignAndExecuteTransactionInput) => Promise<SuiSignAndExecuteTransactionResponse>;
    signMessage: (data: SuiSignMessageInput) => Promise<SuiSignMessageResponse>;
    signPersonalMessage: (data: SuiSignPersonalMessageInput) => Promise<SuiSignPersonalMessageResponse>;
    on: (eventName: SuiListenerType, eventHandler: (data: unknown) => void) => void;
    off: (eventName: SuiListenerType, eventHandler: (data: unknown) => void) => void;
  }

  interface EthereumProvider {
    request: <T extends Omit<Request, 'chainType' | 'origin' | 'requestId'>>(message: T) => Promise<Unknown>;
    on: (eventName: EthereumListenerType, eventHandler: (event?: unknown) => void) => void;
    off: (eventName: EthereumListenerType, eventHandler?: (event?: unknown) => void) => void;
    addListener: (eventName: EthereumListenerType, eventHandler: (event?: unknown) => void) => void;
    removeListener: (eventName: EthereumListenerType, eventHandler?: (event?: unknown) => void) => void;
    enable: () => Promise<unknown>;
    isMetaMask: boolean;
    chainId?: string;
    networkVersion?: string;
  }

  interface BitcoinProvider {
    connectWallet: () => Promise<BitRequestAccountResponse>;
    getWalletProviderName: () => Promise<string>;
    getWalletProviderIcon: () => Promise<string>;
    getAddress: () => Promise<BitGetAddressResponse>;
    getAccounts: () => Promise<string[]>;
    getBalance: () => Promise<BitGetBalanceResponse>;
    getPublicKey: () => Promise<string>;
    getPublicKeyHex: () => Promise<string>;
    signPsbt: (psbtHex: string) => Promise<BitSignPsbtResposne>;
    signPsbts: (psbtHexs: string[]) => Promise<BitSignPsbtsResposne>;
    getNetwork: () => Promise<Network>;
    signMessage: (message: string, type?: 'ecdsa' | 'bip322-simple') => Promise<string>;
    signMessageBIP322: (message: string) => Promise<string>;
    switchNetwork: (network: Network) => Promise<Network>;
    sendBitcoin: (to: string, satAmount: number) => Promise<BitSendBitcoinResponse>;
    pushTx: (txHex: string) => Promise<string>;
    on: (eventName: BitcoinListenerType, callBack: () => void) => void;
    off: (eventName: BitcoinListenerType, callBack: () => void) => void;
  }

  interface AptosProvider {
    request: <T extends Omit<Request, 'chainType' | 'origin' | 'requestId'>>(message: T) => Promise<Unknown>;
    on: (eventName: AptosListenerType, eventHandler: (data?: unknown) => void) => void;
    off: (eventName: AptosListenerType, eventHandler: (data: unknown) => void) => void;
    connect: () => Promise<AptosConnectResponse>;
    network: () => Promise<AptosNetworkResponse>;
    disconnect: () => Promise<AptosDisconnectResponse>;
    isConnected: () => Promise<AptosIsConnectedResponse>;
    account: () => Promise<AptosAccountResponse>;
    signAndSubmitTransaction: (payload: AptosSignPayload) => Promise<AptosSignAndSubmitTransactionResponse>;
    signTransaction: (payload: AptosSignPayload) => Promise<AptosSignTransactionResponse>;
    signMessage: (params: AptosSignMessage['params'][0]) => Promise<AptosSignMessageResponse>;
    onNetworkChange: (eventHandler: (data?: unknown) => void) => void;
    offNetworkChange: (eventHandler: (data?: unknown) => void) => void;
    onAccountChange: (eventHandler: (data?: unknown) => void) => void;
    offAccountChange: (eventHandler: (data?: unknown) => void) => void;
  }

  interface Window {
    customProperty: boolean;

    addEventListener<K extends keyof CustomEventMap>(type: K, listener: (event: CustomEventMap[K]) => void): void;

    removeEventListener<K extends keyof CustomEventMap>(type: K, listener: (event: CustomEventMap[K]) => void, options?: boolean | EventListenerOptions): void;
    cosmostation: {
      version: string;
      common: CommonProvider;
      cosmos: CosmosProvider;
      ethereum: EthereumProvider;
      sui: SuiProvider;
      bitcoin: BitcoinProvider;
      aptos: AptosProvider;
      providers: {
        keplr: KeplrInterface;
        metamask: EthereumProvider;
      };
    };
    cosmostationWallet?: SuiProvider;
    keplr?: KeplrInterface;
    getOfflineSigner?: unknown;
    getOfflineSignerOnlyAmino?: unknown;
    getOfflineSignerAuto?: unknown;

    ethereum?: EthereumProvider;
    suiWallet?: SuiProvider;
    aptos?: AptosProvider;
  }
}

interface CustomEventMap {
  cosmostation_request: CustomEvent<Request>;
  cosmostation_response: CustomEvent<Response>;
}

export {};
