import AccessRequest from '~/Popup/components/AccessRequest';
import ActivateChainRequest from '~/Popup/components/ActivateChainRequest';
import Lock from '~/Popup/components/Lock';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { EthAddNetwork } from '~/types/ethereum/message';

import Entry from './entry';
import Layout from './layout';

export default function AddNetwork() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isEthAddNetwork(currentQueue)) {
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

function isEthAddNetwork(queue: Queue): queue is Queue<EthAddNetwork> {
  return queue?.message?.method === 'eth_addNetwork';
}
