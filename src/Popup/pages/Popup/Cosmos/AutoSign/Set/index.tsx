import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { CosSetAutoSign } from '~/types/message/cosmos';

import Entry from './entry';
import Layout from './layout';

export default function Set() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isCosSetAutoSign(currentQueue)) {
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

function isCosSetAutoSign(queue: Queue): queue is Queue<CosSetAutoSign> {
  return queue?.message?.method === 'cos_setAutoSign';
}
