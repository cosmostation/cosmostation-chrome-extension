import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { EthSignTypedData } from '~/types/message/ethereum';

import Entry from './entry';
import Layout from './layout';

export default function SignTypedData() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isEthSignTypedData(currentQueue)) {
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

function isEthSignTypedData(queue: Queue): queue is Queue<EthSignTypedData> {
  return queue?.message?.method === 'eth_signTypedData_v3' || queue?.message?.method === 'eth_signTypedData_v4';
}
