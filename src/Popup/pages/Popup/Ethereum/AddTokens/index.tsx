import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { EthcAddTokens } from '~/types/message/ethereum';

import Entry from './entry';
import Layout from './layout';

export default function AddTokens() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isEthAddTokens(currentQueue)) {
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

function isEthAddTokens(queue: Queue): queue is Queue<EthcAddTokens> {
  return queue?.message?.method === 'ethc_addTokens';
}
