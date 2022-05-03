import AccessRequest from '~/Popup/components/AccessRequest';
import ActivateChainRequest from '~/Popup/components/ActivateChainRequest';
import Lock from '~/Popup/components/Lock';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { EthSign } from '~/types/ethereum/message';

import Entry from './entry';
import Layout from './layout';

export default function Sign() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isEthSign(currentQueue)) {
    return (
      <Lock>
        <AccessRequest>
          <ActivateChainRequest>
            <Layout>
              <Entry queue={currentQueue} />
            </Layout>
          </ActivateChainRequest>
        </AccessRequest>
      </Lock>
    );
  }
  return null;
}

function isEthSign(queue: Queue): queue is Queue<EthSign> {
  return queue?.message?.method === 'eth_sign';
}
