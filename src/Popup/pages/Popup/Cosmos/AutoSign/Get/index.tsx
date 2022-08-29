import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import ActivateChainRequest from '~/Popup/components/requests/ActivateChainRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { CosGetAutoSign } from '~/types/cosmos/message';

import Entry from './entry';
import Layout from './layout';

export default function Get() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isCosGetAutoSign(currentQueue)) {
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

function isCosGetAutoSign(queue: Queue): queue is Queue<CosGetAutoSign> {
  return queue?.message?.method === 'cos_getAutoSign';
}
