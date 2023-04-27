import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { EthSendTransaction, EthSignTransaction } from '~/types/message/ethereum';

import Entry from './entry';
import Layout from './layout';

export default function Transaction() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isEthTransaction(currentQueue)) {
    return (
      <Lock>
        <LedgerPublicKeyRequest>
          <AccessRequest>
            <Layout>
              <Entry queue={currentQueue} />
            </Layout>
          </AccessRequest>
        </LedgerPublicKeyRequest>
      </Lock>
    );
  }

  return null;
}

function isEthTransaction(queue: Queue): queue is Queue<EthSignTransaction | EthSendTransaction> {
  return queue?.message?.method === 'eth_signTransaction' || queue?.message?.method === 'eth_sendTransaction';
}
