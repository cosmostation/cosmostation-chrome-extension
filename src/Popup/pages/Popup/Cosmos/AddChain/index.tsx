import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import ErrorPage from '~/Popup/components/ErrorPage';
import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { CosAddChain } from '~/types/message/cosmos';

import Entry from './entry';
import Layout from './layout';

export default function AddChain() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isCosAddChain(currentQueue)) {
    return (
      <Lock>
        <AccessRequest>
          <Layout>
            <ErrorBoundary
              // eslint-disable-next-line react/no-unstable-nested-components
              FallbackComponent={(props) => <ErrorPage queue={currentQueue} {...props} />}
            >
              <Suspense fallback={null}>
                <Entry queue={currentQueue} />
              </Suspense>
            </ErrorBoundary>
          </Layout>
        </AccessRequest>
      </Lock>
    );
  }
  return null;
}

function isCosAddChain(queue: Queue): queue is Queue<CosAddChain> {
  return queue?.message?.method === 'cos_addChain' || queue?.message?.method === 'ten_addChain';
}
