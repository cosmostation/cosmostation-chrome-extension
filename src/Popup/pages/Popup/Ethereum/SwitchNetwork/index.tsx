import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { EthcSwitchNetwork } from '~/types/message/ethereum';

import Entry from './entry';
import Layout from './layout';

export default function SwitchNetwork() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isEthAddNetwork(currentQueue)) {
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

function isEthAddNetwork(queue: Queue): queue is Queue<EthcSwitchNetwork> {
  return queue?.message?.method === 'ethc_switchNetwork';
}
