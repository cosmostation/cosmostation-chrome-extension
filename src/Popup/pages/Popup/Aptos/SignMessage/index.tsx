import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { APTOS } from '~/constants/chain/aptos/aptos';
import ErrorPage from '~/Popup/components/ErrorPage';
import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentAptosNetwork } from '~/Popup/hooks/useCurrent/useCurrentAptosNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { AptosSignMessage } from '~/types/message/aptos';

import Entry from './entry';
import Layout from './layout';

export default function SignMessage() {
  const { currentQueue } = useCurrentQueue();
  const { currentAptosNetwork } = useCurrentAptosNetwork();

  if (currentQueue && isSignMessage(currentQueue)) {
    return (
      <Lock>
        <LedgerPublicKeyRequest>
          <AccessRequest>
            <Layout>
              <ErrorBoundary
                // eslint-disable-next-line react/no-unstable-nested-components
                FallbackComponent={(props) => <ErrorPage queue={currentQueue} chain={APTOS} network={currentAptosNetwork} {...props} />}
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

function isSignMessage(queue: Queue): queue is Queue<AptosSignMessage> {
  return queue?.message?.method === 'aptos_signMessage';
}
