import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { SuiSignMessage } from '~/types/message/sui';

import Entry from './entry';
import Layout from './layout';

export default function SignMessage() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isSignMessage(currentQueue)) {
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

function isSignMessage(queue: Queue): queue is Queue<SuiSignMessage> {
  return queue?.message?.method === 'sui_signMessage' || queue?.message?.method === 'sui_signPersonalMessage';
}
