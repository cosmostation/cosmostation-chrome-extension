import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { COSMOS_CHAINS } from '~/constants/chain';
import Empty from '~/Popup/components/common/Empty';
import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { CosSignAmino } from '~/types/message/cosmos';

import Entry from './entry';
import Layout from './layout';

export default function Amino() {
  const { currentQueue } = useCurrentQueue();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();

  if (currentQueue && isCosSignAmino(currentQueue)) {
    const selectedChain = [...COSMOS_CHAINS, ...currentCosmosAdditionalChains].find((item) => item.chainName === currentQueue.message.params.chainName);

    if (selectedChain) {
      return (
        <Lock>
          <LedgerPublicKeyRequest>
            <AccessRequest>
              <Layout>
                <ErrorBoundary fallback={<Empty />}>
                  <Suspense fallback={null}>
                    <Entry queue={currentQueue} chain={selectedChain} />
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            </AccessRequest>
          </LedgerPublicKeyRequest>
        </Lock>
      );
    }
  }

  return null;
}

function isCosSignAmino(queue: Queue): queue is Queue<CosSignAmino> {
  return queue?.message?.method === 'cos_signAmino' || queue?.message?.method === 'ten_signAmino';
}
