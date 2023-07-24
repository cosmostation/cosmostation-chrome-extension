import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { COSMOS_CHAINS } from '~/constants/chain';
import Empty from '~/Popup/components/common/Empty';
import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { CosSignDirect } from '~/types/message/cosmos';

import Entry from './entry';
import Layout from './layout';

export default function Direct() {
  const { currentQueue } = useCurrentQueue();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();

  if (currentQueue && isCosSignDirect(currentQueue)) {
    const selectedChain = [...COSMOS_CHAINS, ...currentCosmosAdditionalChains].find((item) => item.chainName === currentQueue.message.params.chainName);

    if (selectedChain) {
      return (
        <Lock>
          <AccessRequest>
            <Layout>
              <ErrorBoundary fallback={<Empty />}>
                <Suspense fallback={null}>
                  <Entry queue={currentQueue} chain={selectedChain} />
                </Suspense>
              </ErrorBoundary>
            </Layout>
          </AccessRequest>
        </Lock>
      );
    }
  }

  return null;
}

function isCosSignDirect(queue: Queue): queue is Queue<CosSignDirect> {
  return queue?.message?.method === 'cos_signDirect' || queue?.message?.method === 'ten_signDirect';
}
