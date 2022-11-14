import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import ActivateChainRequest from '~/Popup/components/requests/ActivateChainRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
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
            <ActivateChainRequest>
              <Layout>
                <Entry queue={currentQueue} />
              </Layout>
            </ActivateChainRequest>
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
