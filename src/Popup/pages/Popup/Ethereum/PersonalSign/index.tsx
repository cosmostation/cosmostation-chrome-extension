import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import LedgerPublicKeyRequest from '~/Popup/components/requests/LedgerPublicKeyRequest';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/extensionStorage';
import type { PersonalSign } from '~/types/message/ethereum';

import Entry from './entry';
import Layout from './layout';

export default function PersonalSign() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isPersonalSign(currentQueue)) {
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

function isPersonalSign(queue: Queue): queue is Queue<PersonalSign> {
  return queue?.message?.method === 'personal_sign';
}
