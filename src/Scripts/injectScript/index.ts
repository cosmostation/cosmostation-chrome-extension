import { registerCosmosWallet } from '@cosmostation/wallets';
import { registerWallet } from '@wallet-standard/core';

import type { ListenerMessage } from '~/types/message';
import type { ComProvidersResponse } from '~/types/message/common';

import { aptos } from './aptos';
import { common } from './common';
import { cosmos, cosmosWallet, keplr, tendermint } from './cosmos';
import { announceEip6963Provider, ethereum } from './ethereum';
import { sui, SuiStandard } from './sui';

void (() => {
  window.cosmostation = {
    version: String(process.env.VERSION),
    providers: { metamask: ethereum, keplr },
    handlerInfos: [],
    common,
    ethereum,
    cosmos,
    aptos,
    tendermint,
    sui,
  };

  window.cosmostationWallet = sui;

  registerWallet(new SuiStandard());
  registerCosmosWallet(cosmosWallet);

  announceEip6963Provider();

  void (async () => {
    const currentChainId = (await window.cosmostation.ethereum.request({ method: 'eth_chainId', params: [] })) as string;
    window.cosmostation.ethereum.chainId = currentChainId;
    window.cosmostation.ethereum.networkVersion = `${parseInt(currentChainId, 16)}`;

    window.cosmostation.ethereum.on('chainChanged', (chainId) => {
      window.cosmostation.ethereum.chainId = chainId as string;
      window.cosmostation.ethereum.networkVersion = `${parseInt(chainId as string, 16)}`;
    });

    const cosmostationEvent = new CustomEvent('cosmostation_keystorechange', { cancelable: true });

    window.addEventListener('message', (event: MessageEvent<ListenerMessage>) => {
      if (event.data?.isCosmostation && event.data?.type === 'accountChanged' && event.data?.line === 'COSMOS') {
        window.dispatchEvent(cosmostationEvent);
      }
    });

    const providers = (await window.cosmostation.common.request({ method: 'com_providers' })) as ComProvidersResponse;

    if (providers.keplr && !window.keplr) {
      window.keplr = window.cosmostation.providers.keplr;

      window.getOfflineSigner = window.cosmostation.providers.keplr.getOfflineSigner;
      window.getOfflineSignerOnlyAmino = window.cosmostation.providers.keplr.getOfflineSignerOnlyAmino;
      window.getOfflineSignerAuto = window.cosmostation.providers.keplr.getOfflineSignerAuto;

      const keplrEvent = new CustomEvent('keplr_keystorechange', { cancelable: true });

      const handler = (event: MessageEvent<ListenerMessage>) => {
        if (event.data?.isCosmostation && event.data?.type === 'accountChanged' && event.data?.line === 'COSMOS') {
          window.dispatchEvent(keplrEvent);
        }
      };

      window.addEventListener('message', handler);
    }

    if (providers.metamask && !window.ethereum?.isMetaMask) {
      window.cosmostation.ethereum.isMetaMask = true;
      window.ethereum = window.cosmostation.providers.metamask;
    }

    if (providers.aptos) {
      window.aptos = aptos;
    }
  })();
})();
