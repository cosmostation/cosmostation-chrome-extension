import { Suspense } from 'react';

import { COSMOS_CHAINS } from '~/constants/chain';
import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { CosSignMessage } from '~/types/message/cosmos';

import Entry from './entry';
import Layout from './layout';

export default function Message() {
  const { currentQueue } = useCurrentQueue();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();

  if (currentQueue && isCosSignMessage(currentQueue)) {
    const selectedChain = [...COSMOS_CHAINS, ...currentCosmosAdditionalChains].find((item) => item.chainName === currentQueue.message.params.chainName);

    if (selectedChain) {
      return (
        <Lock>
          <LedgerPublicKeyRequest>
            <AccessRequest>
              <Layout>
                <Suspense fallback={null}>
                  <Entry queue={currentQueue} chain={selectedChain} />
                </Suspense>
              </Layout>
            </AccessRequest>
          </LedgerPublicKeyRequest>
        </Lock>
      );
    }
  }

  return null;
}

function isCosSignMessage(queue: Queue): queue is Queue<CosSignMessage> {
  return queue?.message?.method === 'cos_signMessage';
}
