import type { Keplr } from '@keplr-wallet/types';
import type {
  SuiSignAndExecuteTransactionBlockInput,
  SuiSignAndExecuteTransactionInput,
  SuiSignMessageInput,
  SuiSignPersonalMessageInput,
  SuiSignTransactionBlockInput,
  SuiSignTransactionInput,
} from '@mysten/wallet-standard';

import type { ApprovedSuiPermissionType } from '@/types/extension';
import type { SuiListenerType } from '@/types/message';
import type { BaseRequest, CommonRequest, Request, Response } from '@/types/message/inject';
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

  interface Window {
    customProperty: boolean;

    addEventListener<K extends keyof CustomEventMap>(type: K, listener: (event: CustomEventMap[K]) => void): void;

    removeEventListener<K extends keyof CustomEventMap>(type: K, listener: (event: CustomEventMap[K]) => void, options?: boolean | EventListenerOptions): void;
    cosmostation: {
      version: string;
      common: CommonProvider;
      cosmos: CosmosProvider;
      sui: SuiProvider;
      providers: {
        keplr: KeplrInterface;
        // metamask: MetaMask;
      };
    };
    cosmostationWallet?: SuiProvider;
    keplr?: KeplrInterface;
    getOfflineSigner?: unknown;
    getOfflineSignerOnlyAmino?: unknown;
    getOfflineSignerAuto?: unknown;
    suiWallet?: SuiProvider;
  }
}

interface CustomEventMap {
  cosmostation_request: CustomEvent<Request>;
  cosmostation_response: CustomEvent<Response>;
}

export {};
