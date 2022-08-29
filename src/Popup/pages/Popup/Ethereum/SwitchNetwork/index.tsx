import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import ActivateChainRequest from '~/Popup/components/requests/ActivateChainRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { EthcSwitchNetwork } from '~/types/ethereum/message';

import Entry from './entry';
import Layout from './layout';

export default function SwitchNetwork() {
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

function isEthAddNetwork(queue: Queue): queue is Queue<EthcSwitchNetwork> {
  return queue?.message?.method === 'ethc_switchNetwork';
}
