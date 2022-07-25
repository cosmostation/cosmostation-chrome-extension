import AccessRequest from '~/Popup/components/AccessRequest';
import ActivateChainRequest from '~/Popup/components/ActivateChainRequest';
import Lock from '~/Popup/components/Lock';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { CosSetAutoSign } from '~/types/cosmos/message';

import Entry from './entry';
import Layout from './layout';

export default function AutoSign() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isCosSetAutoSign(currentQueue)) {
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

function isCosSetAutoSign(queue: Queue): queue is Queue<CosSetAutoSign> {
  return queue?.message?.method === 'cos_setAutoSign';
}
