import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { BitSwitchNetwork } from '~/types/message/bitcoin';

import Entry from './entry';
import Layout from './layout';

export default function SwitchNetwork() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isSwitchNetwork(currentQueue)) {
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

function isSwitchNetwork(queue: Queue): queue is Queue<BitSwitchNetwork> {
  return queue?.message?.method === 'bitc_switchNetwork';
}
