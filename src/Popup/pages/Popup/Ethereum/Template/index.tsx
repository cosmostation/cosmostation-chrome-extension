import AccessRequest from '~/Popup/components/AccessRequest';
import ActivateChainRequest from '~/Popup/components/ActivateChainRequest';
import Lock from '~/Popup/components/Lock';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { EthcAddNetwork } from '~/types/ethereum/message';

import Entry from './entry';
import Layout from './layout';

export default function AddNetwork() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isEthcAddNetwork(currentQueue)) {
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

function isEthcAddNetwork(queue: Queue): queue is Queue<EthcAddNetwork> {
  return queue?.message?.method === 'ethc_addNetwork';
}
