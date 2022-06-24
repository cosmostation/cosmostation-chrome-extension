import AccessRequest from '~/Popup/components/AccessRequest';
import ActivateChainRequest from '~/Popup/components/ActivateChainRequest';
import Lock from '~/Popup/components/Lock';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { EthSendTransaction, EthSignTransaction } from '~/types/ethereum/message';

import Entry from './entry';
import Layout from './layout';

export default function Transaction() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isEthTransaction(currentQueue)) {
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

function isEthTransaction(queue: Queue): queue is Queue<EthSignTransaction | EthSendTransaction> {
  return queue?.message?.method === 'eth_signTransaction' || queue?.message?.method === 'eth_sendTransaction';
}
