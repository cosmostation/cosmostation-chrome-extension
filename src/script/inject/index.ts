import { registerWallet } from '@mysten/wallet-standard';

import type { ComProvidersResponse } from '@/types/message/inject/common';

import { CosmostationBitcoin } from './bitcoin/provider/bitcoin';
import { commonProvider } from './common/provider';
import { cosmosProvider } from './cosmos/provider/cosmostation';
import { keplrProvider } from './cosmos/provider/keplr';
import { announceEip6963Provider } from './evm/provider/eip6963';
import { Ethereum } from './evm/provider/evm';
import { suiProvider, SuiStandard } from './sui/provider/sui';

void (() => {
  window.cosmostation = {
    version: __APP_VERSION__,
    common: commonProvider,
    cosmos: cosmosProvider,
    ethereum: Ethereum.getInstance(),
    bitcoin: CosmostationBitcoin.getInstance(),
    sui: suiProvider,
    providers: {
      keplr: keplrProvider,
      metamask: Ethereum.getInstance(),
    },
  };

  window.cosmostationWallet = suiProvider;

  registerWallet(new SuiStandard());
  announceEip6963Provider();

  void (async () => {
    const currentChainId = (await window.cosmostation.ethereum.request({ method: 'eth_chainId', params: [] })) as string;
    window.cosmostation.ethereum.chainId = currentChainId;
    window.cosmostation.ethereum.networkVersion = `${parseInt(currentChainId, 16)}`;

    window.cosmostation.ethereum.on('chainChanged', (chainId) => {
      window.cosmostation.ethereum.chainId = chainId as string;
      window.cosmostation.ethereum.networkVersion = `${parseInt(chainId as string, 16)}`;
    });

    const providers = (await window.cosmostation.common.request({ method: 'com_providers' })) as ComProvidersResponse;

    if (providers.keplr && !window.keplr) {
      window.keplr = window.cosmostation.providers.keplr;

      window.getOfflineSigner = window.cosmostation.providers.keplr.getOfflineSigner;
      window.getOfflineSignerOnlyAmino = window.cosmostation.providers.keplr.getOfflineSignerOnlyAmino;
      window.getOfflineSignerAuto = window.cosmostation.providers.keplr.getOfflineSignerAuto;

      // const keplrEvent = new CustomEvent('keplr_keystorechange', { cancelable: true });

      // const handler = (event: MessageEvent<ListenerMessage>) => {
      //   if (event.data?.isCosmostation && event.data?.type === 'accountChanged' && event.data?.line === 'COSMOS') {
      //     window.dispatchEvent(keplrEvent);
      //   }
      // };

      // window.addEventListener('message', handler);
    }
  })();
})();
