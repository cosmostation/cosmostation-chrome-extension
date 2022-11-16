import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { CosDeleteAutoSign } from '~/types/message/cosmos';

import Entry from './entry';
import Layout from './layout';

export default function Delete() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isCosDeleteAutoSign(currentQueue)) {
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

function isCosDeleteAutoSign(queue: Queue): queue is Queue<CosDeleteAutoSign> {
  return queue?.message?.method === 'cos_deleteAutoSign';
}
