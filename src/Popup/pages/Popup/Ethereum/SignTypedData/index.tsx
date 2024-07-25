import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import ErrorPage from '~/Popup/components/ErrorPage';
import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { EthSignTypedData } from '~/types/message/ethereum';

import Entry from './entry';
import Layout from './layout';

export default function SignTypedData() {
  const { currentQueue } = useCurrentQueue();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  if (currentQueue && isEthSignTypedData(currentQueue)) {
    return (
      <Lock>
        <LedgerPublicKeyRequest>
          <AccessRequest>
            <Layout>
              <ErrorBoundary
                // eslint-disable-next-line react/no-unstable-nested-components
                FallbackComponent={(props) => <ErrorPage queue={currentQueue} chain={ETHEREUM} network={currentEthereumNetwork} {...props} />}
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

function isEthSignTypedData(queue: Queue): queue is Queue<EthSignTypedData> {
  return queue?.message?.method === 'eth_signTypedData_v3' || queue?.message?.method === 'eth_signTypedData_v4';
}
