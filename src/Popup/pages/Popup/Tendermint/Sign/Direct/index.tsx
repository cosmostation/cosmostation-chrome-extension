import { TENDERMINT_CHAINS } from '~/constants/chain';
import AccessRequest from '~/Popup/components/AccessRequest';
import ActivateChainRequest from '~/Popup/components/ActivateChainRequest';
import Lock from '~/Popup/components/Lock';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { TenSignDirect } from '~/types/tendermint/message';

import Entry from './entry';
import Layout from './layout';

export default function AddChain() {
  const { currentQueue } = useCurrentQueue();
  const { currentTendermintAdditionalChains } = useCurrentAdditionalChains();

  if (currentQueue && isTenSignDirect(currentQueue)) {
    const selecteChain = [...TENDERMINT_CHAINS, ...currentTendermintAdditionalChains].find((item) => item.chainName === currentQueue.message.params.chainName);

    const { message } = currentQueue;
    const { params } = message;

    const { doc } = params;

    const authInfoBytes = Buffer.from(doc.auth_info_bytes as unknown as string, 'hex');
    const bodyBytes = Buffer.from(doc.body_bytes as unknown as string, 'hex');

    const newDoc = { ...doc, auth_info_bytes: authInfoBytes, body_bytes: bodyBytes };

    const newCurrentQueue = { ...currentQueue, message: { ...message, params: { ...params, doc: newDoc } } };

    if (selecteChain) {
      return (
        <Lock>
          <AccessRequest>
            <ActivateChainRequest>
              <Layout>
                <Entry queue={newCurrentQueue} chain={selecteChain} />
              </Layout>
            </ActivateChainRequest>
          </AccessRequest>
        </Lock>
      );
    }
  }

  return null;
}

function isTenSignDirect(queue: Queue): queue is Queue<TenSignDirect> {
  return queue?.message?.method === 'ten_signDirect';
}
