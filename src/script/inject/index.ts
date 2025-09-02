import { registerWallet as registerAptosWallet } from '@aptos-labs/wallet-standard';
import { registerCosmosWallet } from '@cosmostation/wallets';
import { registerWallet as registerIotaWallet } from '@iota/wallet-standard';
import { registerWallet as registerSuiWallet } from '@mysten/wallet-standard';

import type { EventDetail } from '@/types/message';
import type { ComProvidersResponse } from '@/types/message/inject/common';

import { CosmostationAptos } from './aptos/provider/aptos';
import { CosmostationBitcoin } from './bitcoin/provider/bitcoin';
import { CosmostaionCommon } from './common/provider';
import { CosmostaionCosmos } from './cosmos/provider/cosmostation';
import { CosmostationKeplr } from './cosmos/provider/keplr';
import { cosmosWallet } from './cosmos/provider/wallets';
import { announceEip6963Provider } from './evm/provider/eip6963';
import { CosmostaionEthereum } from './evm/provider/evm';
import { CosmostationIota, IotaStandard } from './iota/provider/iota';
import { CosmostationSolana } from './solana/provider/solana';
import { initialize } from './solana/provider/solana2';
import { CosmostationSui, SuiStandard } from './sui/provider/sui';

if (!window.__cosmostationInjected__) {
  window.__cosmostationInjected__ = true;

  void (() => {
    if (typeof window === 'undefined') return;

    if (!window.cosmostation) {
      window.cosmostation = {
        version: __APP_VERSION__,
        common: CosmostaionCommon.getInstance(),
        cosmos: CosmostaionCosmos.getInstance(),
        ethereum: CosmostaionEthereum.getInstance(),
        bitcoin: CosmostationBitcoin.getInstance(),
        sui: CosmostationSui.getInstance(),
        aptos: CosmostationAptos.getInstance(),
        iota: CosmostationIota.getInstance(),
        solana: CosmostationSolana.getInstance(),
        providers: {
          keplr: CosmostationKeplr.getInstance(),
          metamask: CosmostaionEthereum.getInstance(),
        },
      };

      window.cosmostationWallet = CosmostationSui.getInstance();

      registerIotaWallet(new IotaStandard());
      registerSuiWallet(new SuiStandard());
      registerCosmosWallet(cosmosWallet);
      registerAptosWallet(CosmostationAptos.getInstance());
      initialize();

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

        const accountChangedHandler = (event: CustomEvent<EventDetail>) => {
          if (event?.type === 'accountChanged' && event.detail.chainType === 'cosmos') {
            window.dispatchEvent(cosmostationEvent);
          }
        };

        window.addEventListener('accountChanged', accountChangedHandler as EventListener);

        const providers = (await window.cosmostation.common.request({ method: 'com_providers' })) as ComProvidersResponse;

        if (providers.keplr && !window.keplr) {
          window.keplr = window.cosmostation.providers.keplr;

          window.getOfflineSigner = window.cosmostation.providers.keplr.getOfflineSigner;
          window.getOfflineSignerOnlyAmino = window.cosmostation.providers.keplr.getOfflineSignerOnlyAmino;
          window.getOfflineSignerAuto = window.cosmostation.providers.keplr.getOfflineSignerAuto;

          const keplrEvent = new CustomEvent('keplr_keystorechange', { cancelable: true });

          const handler = (event: CustomEvent<EventDetail>) => {
            if (event?.type === 'accountChanged' && event.detail.chainType === 'cosmos') {
              window.dispatchEvent(keplrEvent);
            }
          };

          window.addEventListener('accountChanged', handler as EventListener);
        }

        if (providers.metamask && !window.ethereum) {
          window.cosmostation.ethereum.isMetaMask = true;
          window.ethereum = window.cosmostation.providers.metamask;
        }
      })();
    }
  })();
}
