import { registerWallet } from '@mysten/wallet-standard';

import type { ComProvidersResponse } from '@/types/message/inject/common';

import { CosmostationAptos } from './aptos/provider/aptos';
import { CosmostationBitcoin } from './bitcoin/provider/bitcoin';
import { commonProvider } from './common/provider';
import { cosmosProvider } from './cosmos/provider/cosmostation';
import { keplrProvider } from './cosmos/provider/keplr';
import { announceEip6963Provider } from './evm/provider/eip6963';
import { CosmostaionEthereum } from './evm/provider/evm';
import { suiProvider, SuiStandard } from './sui/provider/sui';

void (() => {
  window.cosmostation = {
    version: __APP_VERSION__,
    common: commonProvider,
    cosmos: cosmosProvider,
    ethereum: CosmostaionEthereum.getInstance(),
    bitcoin: CosmostationBitcoin.getInstance(),
    sui: suiProvider,
    aptos: CosmostationAptos.getInstance(),
    providers: {
      keplr: keplrProvider,
      metamask: CosmostaionEthereum.getInstance(),
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

    // const cosmostationEvent = new CustomEvent('cosmostation_keystorechange', { cancelable: true });

    // window.addEventListener('accountChanged', (event) => {
    //   console.log('🚀 ~ window.addEventListener ~ event:', event);

    //   if (event.data?.event === 'accountChanged' && event.detail.chainType === 'cosmos') {
    //     window.dispatchEvent(cosmostationEvent);
    //   }
    // });

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

    if (providers.metamask && !window.ethereum?.isMetaMask) {
      window.cosmostation.ethereum.isMetaMask = true;
      window.ethereum = window.cosmostation.providers.metamask;
    }

    if (providers.aptos) {
      window.aptos = CosmostationAptos.getInstance();
    }
  })();
})();
