import type { Keplr } from '@keplr-wallet/types';

import type { BaseRequest, CommonRequest, Request, Response } from '@/types/message/inject';
import type { CommonRequest } from '@/types/message/inject/common';

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
  interface Window {
    customProperty: boolean;

    addEventListener<K extends keyof CustomEventMap>(type: K, listener: (event: CustomEventMap[K]) => void): void;

    removeEventListener<K extends keyof CustomEventMap>(type: K, listener: (event: CustomEventMap[K]) => void, options?: boolean | EventListenerOptions): void;
    cosmostation: {
      version: string;
      common: CommonProvider;
      cosmos: CosmosProvider;
      providers: {
        keplr: KeplrInterface;
        // metamask: MetaMask;
      };
    };
    keplr?: KeplrInterface;
    getOfflineSigner?: unknown;
    getOfflineSignerOnlyAmino?: unknown;
    getOfflineSignerAuto?: unknown;
  }
}

interface CustomEventMap {
  cosmostation_request: CustomEvent<Request>;
  cosmostation_response: CustomEvent<Response>;
}

export {};
