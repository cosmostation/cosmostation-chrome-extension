import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Empty from '~/Popup/components/common/Empty';
import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { SuiSignAndExecuteTransaction, SuiSignAndExecuteTransactionBlock, SuiSignTransaction, SuiSignTransactionBlock } from '~/types/message/sui';

import Entry from './entry';
import Layout from './layout';

export default function Transaction() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isSuiTransaction(currentQueue)) {
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

function isSuiTransaction(
  queue: Queue,
): queue is Queue<SuiSignAndExecuteTransactionBlock | SuiSignTransactionBlock | SuiSignAndExecuteTransaction | SuiSignTransaction> {
  return (
    queue?.message?.method === 'sui_signAndExecuteTransactionBlock' ||
    queue?.message?.method === 'sui_signTransactionBlock' ||
    queue?.message?.method === 'sui_signTransaction' ||
    queue?.message?.method === 'sui_signAndExecuteTransaction'
  );
}
