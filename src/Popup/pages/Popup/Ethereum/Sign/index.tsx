import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import ActivateChainRequest from '~/Popup/components/requests/ActivateChainRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { EthSign } from '~/types/message/ethereum';

import Entry from './entry';
import Layout from './layout';

export default function Sign() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isEthSign(currentQueue)) {
    return (
      <Lock>
        <LedgerPublicKeyRequest>
          <AccessRequest>
            <ActivateChainRequest>
              <Layout>
                <Entry queue={currentQueue} />
              </Layout>
            </ActivateChainRequest>
          </AccessRequest>
        </LedgerPublicKeyRequest>
      </Lock>
    );
  }
  return null;
}

function isEthSign(queue: Queue): queue is Queue<EthSign> {
  return queue?.message?.method === 'eth_sign';
}
