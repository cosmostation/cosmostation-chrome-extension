import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { CosGetAutoSign } from '~/types/message/cosmos';

import Entry from './entry';
import Layout from './layout';

export default function Get() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isCosGetAutoSign(currentQueue)) {
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

function isCosGetAutoSign(queue: Queue): queue is Queue<CosGetAutoSign> {
  return queue?.message?.method === 'cos_getAutoSign';
}
