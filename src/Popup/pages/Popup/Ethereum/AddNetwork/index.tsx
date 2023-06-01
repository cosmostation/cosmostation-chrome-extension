import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { EthcAddNetwork } from '~/types/message/ethereum';

import Entry from './entry';
import Layout from './layout';

export default function AddNetwork() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isEthcAddNetwork(currentQueue)) {
    return (
      <Lock>
        <AccessRequest>
          <Layout>
            <Entry queue={currentQueue} />
          </Layout>
        </AccessRequest>
      </Lock>
    );
  }
  return null;
}

function isEthcAddNetwork(queue: Queue): queue is Queue<EthcAddNetwork> {
  return queue?.message?.method === 'ethc_addNetwork';
}
