import AccessRequest from '~/Popup/components/AccessRequest';
import Lock from '~/Popup/components/Lock';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { TenAddChain } from '~/types/cosmos/message';

import Entry from './entry';
import Layout from './layout';

export default function AddChain() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isTenAddChain(currentQueue)) {
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

function isTenAddChain(queue: Queue): queue is Queue<TenAddChain> {
  return queue?.message?.method === 'ten_addChain';
}
