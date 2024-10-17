import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { BitSignAndSendTransaction } from '~/types/message/bitcoin';

import Entry from './entry';
import Layout from './layout';

export default function Sign() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isBitSignAndSendTransaction(currentQueue)) {
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

function isBitSignAndSendTransaction(queue: Queue): queue is Queue<BitSignAndSendTransaction> {
  return queue?.message?.method === 'bit_signAndSendTransaction';
}
