import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { AptosSignAndSubmitTransaction, AptosSignTransaction } from '~/types/message/aptos';

import Entry from './entry';
import Layout from './layout';

export default function Transaction() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isAptosTransaction(currentQueue)) {
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

function isAptosTransaction(queue: Queue): queue is Queue<AptosSignTransaction | AptosSignAndSubmitTransaction> {
  return queue?.message?.method === 'aptos_signTransaction' || queue?.message?.method === 'aptos_signAndSubmitTransaction';
}
