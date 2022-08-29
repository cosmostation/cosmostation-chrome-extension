import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import ActivateChainRequest from '~/Popup/components/requests/ActivateChainRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { EthcAddTokens } from '~/types/ethereum/message';

import Entry from './entry';
import Layout from './layout';

export default function AddTokens() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isEthAddTokens(currentQueue)) {
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

function isEthAddTokens(queue: Queue): queue is Queue<EthcAddTokens> {
  return queue?.message?.method === 'ethc_addTokens';
}
