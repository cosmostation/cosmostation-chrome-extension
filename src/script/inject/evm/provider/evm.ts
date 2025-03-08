/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { EthereumListenerType } from '@/types/message';
import type { EthRequestAccountsResponse } from '@/types/message/inject/evm';

import { evmRequestApp } from '../request';

export class Ethereum implements EthereumProvider {
  private static instance: Ethereum;

  isMetaMask = false;
  chainId?: string;
  networkVersion?: string;

  private chainChangedEventHandler: (event: any) => void = () => {};
  private accountsChangedEventHandler: (event: any) => void = () => {};
  private disconnectEventHandler: (event: any) => void = () => {};
  private connectEventHandler: (event: any) => void = () => {};

  public static getInstance(): Ethereum {
    if (!Ethereum.instance) {
      Ethereum.instance = new Ethereum();
    }
    return Ethereum.instance;
  }

  request = evmRequestApp;

  on(eventName: EthereumListenerType, eventHandler: (data: unknown) => void) {
    if (eventName === 'chainChanged') {
      this.chainChangedEventHandler = (event: any) => {
        if (event.detail.chainType === 'evm') {
          eventHandler(event.detail.data.result);
        }
      };

      // FIXME 지금 이 방식은 체인타입에 따라서 분기처리가 안되기때문에 이벤트 네임이 같은 수이나 evm같은 경우에서 백퍼 문제발생함.
      window.addEventListener('chainChanged', this.chainChangedEventHandler);
    }

    if (eventName === 'accountsChanged') {
      this.accountsChangedEventHandler = (event: any) => {
        if (event.detail.chainType === 'evm') {
          eventHandler(event.detail.data.result as string[]);
        }
      };

      window.addEventListener('accountsChanged', this.accountsChangedEventHandler);
    }

    if (eventName === 'disconnect') {
      this.disconnectEventHandler = (event: any) => {
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

      window.addEventListener('disconnect', this.disconnectEventHandler);
    }

    if (eventName === 'connect') {
      this.connectEventHandler = (event: any) => {
        if (event.detail.chainType === 'evm') {
          eventHandler(
            event.detail.data.result as {
              chainId: string;
            },
          );
        }
      };

      window.addEventListener('connect', this.connectEventHandler);
    }
  }

  addListener = this.on;

  off = this.removeListener;

  removeListener(eventName: EthereumListenerType) {
    if (eventName === 'chainChanged') {
      window.removeEventListener('chainChanged', this.chainChangedEventHandler);
    }

    if (eventName === 'accountsChanged') {
      window.removeEventListener('accountsChanged', this.accountsChangedEventHandler);
    }

    if (eventName === 'disconnect') {
      window.removeEventListener('disconnect', this.disconnectEventHandler);
    }

    if (eventName === 'connect') {
      window.removeEventListener('connect', this.connectEventHandler);
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
