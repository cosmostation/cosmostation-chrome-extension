/* eslint-disable @typescript-eslint/no-empty-function */

import type { EthereumListenerType, EventDetail } from '@/types/message';
import type { EthRequestAccountsResponse } from '@/types/message/inject/evm';

import { evmRequestApp } from '../request';

export class CosmostaionEthereum implements EthereumProvider {
  private static instance: CosmostaionEthereum;

  isMetaMask = false;
  chainId?: string;
  networkVersion?: string;

  private chainChangedEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};
  private accountsChangedEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};
  private disconnectEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};
  private connectEventHandler: (event: CustomEvent<EventDetail>) => void = () => {};

  public static getInstance(): CosmostaionEthereum {
    if (!CosmostaionEthereum.instance) {
      CosmostaionEthereum.instance = new CosmostaionEthereum();
    }
    return CosmostaionEthereum.instance;
  }

  request = evmRequestApp;

  on(eventName: EthereumListenerType, eventHandler: (data: unknown) => void) {
    if (eventName === 'chainChanged') {
      this.chainChangedEventHandler = (event: CustomEvent<EventDetail>) => {
        if (event.detail.chainType === 'evm') {
          eventHandler(event.detail.data.result);
        }
      };

      window.addEventListener('chainChanged', this.chainChangedEventHandler as EventListener);
    }

    if (eventName === 'accountsChanged') {
      this.accountsChangedEventHandler = (event: CustomEvent<EventDetail>) => {
        if (event.detail.chainType === 'evm') {
          eventHandler(event.detail.data.result as string[]);
        }
      };

      window.addEventListener('accountsChanged', this.accountsChangedEventHandler as EventListener);
    }

    if (eventName === 'disconnect') {
      this.disconnectEventHandler = (event: CustomEvent<EventDetail>) => {
        if (event.detail.chainType === 'evm') {
          eventHandler(
            event.detail.data.result as {
              message: string;
              code: number;
              data?: unknown;
            },
          );
        }
      };

      window.addEventListener('disconnect', this.disconnectEventHandler as EventListener);
    }

    if (eventName === 'connect') {
      this.connectEventHandler = (event: CustomEvent<EventDetail>) => {
        if (event.detail.chainType === 'evm') {
          eventHandler(
            event.detail.data.result as {
              chainId: string;
            },
          );
        }
      };

      window.addEventListener('connect', this.connectEventHandler as EventListener);
    }
  }

  addListener = this.on;

  off = this.removeListener;

  removeListener(eventName: EthereumListenerType) {
    if (eventName === 'chainChanged') {
      window.removeEventListener('chainChanged', this.chainChangedEventHandler as EventListener);
    }

    if (eventName === 'accountsChanged') {
      window.removeEventListener('accountsChanged', this.accountsChangedEventHandler as EventListener);
    }

    if (eventName === 'disconnect') {
      window.removeEventListener('disconnect', this.disconnectEventHandler as EventListener);
    }

    if (eventName === 'connect') {
      window.removeEventListener('connect', this.connectEventHandler as EventListener);
    }
  }

  // send = () => {
  //   console.log('send');
  // };
  // sendAsync = () => {
  //   console.log('send');
  // };

  enable = () => evmRequestApp({ method: 'eth_requestAccounts' }) as Promise<EthRequestAccountsResponse>;
}
