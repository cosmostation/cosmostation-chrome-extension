import type { ComProvidersResponse } from '@/types/message/inject/common';

import { commonProvider } from './common/provider';
import { cosmosProvider } from './cosmos/provider/cosmostation';
import { keplrProvider } from './cosmos/provider/keplr';

window.cosmostation = {
  version: __APP_VERSION__,
  common: commonProvider,
  cosmos: cosmosProvider,
  providers: {
    keplr: keplrProvider,
  },
};

void (async () => {
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
