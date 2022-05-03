import AccessRequest from '~/Popup/components/AccessRequest';
import ActivateChainRequest from '~/Popup/components/ActivateChainRequest';
import Lock from '~/Popup/components/Lock';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { PersonalSign } from '~/types/ethereum/message';

import Entry from './entry';
import Layout from './layout';

export default function PersonalSign() {
  const { currentQueue } = useCurrentQueue();

  if (currentQueue && isPersonalSign(currentQueue)) {
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

function isPersonalSign(queue: Queue): queue is Queue<PersonalSign> {
  return queue?.message?.method === 'personal_sign';
}
