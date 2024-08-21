import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { SUI } from '~/constants/chain/sui/sui';
import ErrorPage from '~/Popup/components/ErrorPage';
import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import { useCurrentSuiNetwork } from '~/Popup/hooks/useCurrent/useCurrentSuiNetwork';
import type { Queue } from '~/types/extensionStorage';
import type { SuiSignMessage } from '~/types/message/sui';

import Entry from './entry';
import Layout from './layout';

export default function SignMessage() {
  const { currentQueue } = useCurrentQueue();
  const { currentSuiNetwork } = useCurrentSuiNetwork();

  if (currentQueue && isSignMessage(currentQueue)) {
    return (
      <Lock>
        <LedgerPublicKeyRequest>
          <AccessRequest>
            <Layout>
              <ErrorBoundary
                // eslint-disable-next-line react/no-unstable-nested-components
                FallbackComponent={(props) => <ErrorPage queue={currentQueue} chain={SUI} network={currentSuiNetwork} {...props} />}
              >
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

function isSignMessage(queue: Queue): queue is Queue<SuiSignMessage> {
  return queue?.message?.method === 'sui_signMessage' || queue?.message?.method === 'sui_signPersonalMessage';
}
