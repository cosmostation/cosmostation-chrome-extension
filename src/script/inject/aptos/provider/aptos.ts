/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { AptosListenerType } from '@/types/message';
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

import { aptosRequestApp } from '../request';

const connect = () => aptosRequestApp({ method: 'aptos_connect', params: undefined }) as Promise<AptosConnectResponse>;
const disconnect = () => aptosRequestApp({ method: 'aptos_disconnect', params: undefined }) as Promise<AptosDisconnectResponse>;
const isConnected = () => aptosRequestApp({ method: 'aptos_isConnected', params: undefined }) as Promise<AptosIsConnectedResponse>;
const network = () => aptosRequestApp({ method: 'aptos_network', params: undefined }) as Promise<AptosNetworkResponse>;
const account = () => aptosRequestApp({ method: 'aptos_account', params: undefined }) as Promise<AptosAccountResponse>;
const signAndSubmitTransaction = (payload: AptosSignPayload) =>
  aptosRequestApp({ method: 'aptos_signAndSubmitTransaction', params: [payload] }) as Promise<AptosSignAndSubmitTransactionResponse>;
const signTransaction = (payload: AptosSignPayload) =>
  aptosRequestApp({ method: 'aptos_signTransaction', params: [payload] }) as Promise<AptosSignTransactionResponse>;
const signMessage = (params: AptosSignMessage['params'][0]) =>
  aptosRequestApp({ method: 'aptos_signMessage', params: [params] }) as Promise<AptosSignMessageResponse>;

export class CosmostationAptos implements AptosProvider {
  private static instance: AptosProvider;

  private networkChangeEventHandler: (event: any) => void = () => {};
  private accountsChangedEventHandler: (event: any) => void = () => {};

  public static getInstance(): AptosProvider {
    if (!CosmostationAptos.instance) {
      CosmostationAptos.instance = new CosmostationAptos();
    }
    return CosmostationAptos.instance;
  }

  request = aptosRequestApp;
  on(eventName: AptosListenerType, eventHandler: (data: unknown) => void) {
    if (eventName === 'networkChange') {
      this.networkChangeEventHandler = (event: any) => {
        if (event.detail.chainType === 'aptos') {
          eventHandler(event.detail.data.result);
        }
      };

      window.addEventListener('networkChange', this.networkChangeEventHandler);
    }

    if (eventName === 'accountChange') {
      this.accountsChangedEventHandler = (event: any) => {
        if (event.detail.chainType === 'aptos') {
          if (!event.detail.data.result) {
            void (async () => {
              try {
                const account = (await aptosRequestApp({ method: 'aptos_account', params: undefined })) as AptosAccountResponse;

                eventHandler(account.address);
              } catch {
                eventHandler('');
              }
            })();
          } else {
            eventHandler(event.detail.data.result as string);
          }
        }
      };

      window.addEventListener('accountChange', this.accountsChangedEventHandler);
    }
  }
  off(eventName: AptosListenerType) {
    if (eventName === 'networkChange') {
      window.removeEventListener('chainChanged', this.networkChangeEventHandler);
    }

    if (eventName === 'accountChange') {
      window.removeEventListener('accountChange', this.accountsChangedEventHandler);
    }
  }
  connect = connect;
  network = network;
  disconnect = disconnect;
  isConnected = isConnected;
  account = account;
  signAndSubmitTransaction = signAndSubmitTransaction;
  signTransaction = signTransaction;
  signMessage = signMessage;
  onNetworkChange = (eventHandler: (data: unknown) => void) => {
    this.on('networkChange', eventHandler);
  };
  offNetworkChange = () => {
    this.off('networkChange');
  };
  onAccountChange = (eventHandler: (data: unknown) => void) => {
    this.on('accountChange', eventHandler);
  };
  offAccountChange = () => {
    this.off('accountChange');
  };
}
