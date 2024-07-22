import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { COSMOS_CHAINS } from '~/constants/chain';
import ErrorPage from '~/Popup/components/ErrorPage';
import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { CosAddTokensCW20Internal } from '~/types/message/cosmos';

import Entry from './entry';
import Layout from './layout';

export default function AddTokens() {
  const { currentQueue } = useCurrentQueue();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();

  if (currentQueue && isCosAddTokensCW20Internal(currentQueue)) {
    const selectedChain = [...COSMOS_CHAINS, ...currentCosmosAdditionalChains].find((item) => item.chainName === currentQueue.message.params.chainName);

    if (selectedChain) {
      return (
        <Lock>
          <AccessRequest>
            <Layout>
              <ErrorBoundary
                // eslint-disable-next-line react/no-unstable-nested-components
                FallbackComponent={(props) => <ErrorPage queue={currentQueue} chain={selectedChain} {...props} />}
              >
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

function isCosAddTokensCW20Internal(queue: Queue): queue is Queue<CosAddTokensCW20Internal> {
  return queue?.message?.method === 'cos_addTokensCW20Internal';
}
