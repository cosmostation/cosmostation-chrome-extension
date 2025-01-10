import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { BitSignPsbt } from '~/types/message/bitcoin';

import Entry from './entry';
import Layout from './layout';

export default function Send() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isBitcoinTransaction(currentQueue)) {
    return (
      <Lock>
        <LedgerPublicKeyRequest>
          <AccessRequest>
            <Layout>
              <ErrorBoundary fallback={<Empty />}>
                <Suspense fallback={null}>
                  <Entry queue={currentQueue} />
                </Suspense>
              </ErrorBoundary>
            </Layout>
          </AccessRequest>
        </LedgerPublicKeyRequest>
      </Lock>
    );
  }

  return null;
}

function isBitcoinTransaction(queue: Queue): queue is Queue<BitSignPsbt> {
  return queue?.message?.method === 'bit_signPsbt';
}
