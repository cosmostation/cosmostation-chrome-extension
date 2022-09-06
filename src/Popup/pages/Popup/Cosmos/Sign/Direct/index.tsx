import { Suspense } from 'react';

import { COSMOS_CHAINS } from '~/constants/chain';
import Lock from '~/Popup/components/Lock';
import AccessRequest from '~/Popup/components/requests/AccessRequest';
import ActivateChainRequest from '~/Popup/components/requests/ActivateChainRequest';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { CosSignDirect } from '~/types/message/cosmos';

import Entry from './entry';
import Layout from './layout';

export default function AddChain() {
  const { currentQueue } = useCurrentQueue();
  const { currentCosmosAdditionalChains } = useCurrentAdditionalChains();

  if (currentQueue && isCosSignDirect(currentQueue)) {
    const selecteChain = [...COSMOS_CHAINS, ...currentCosmosAdditionalChains].find((item) => item.chainName === currentQueue.message.params.chainName);

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
                <Suspense fallback={null}>
                  <Entry queue={newCurrentQueue} chain={selecteChain} />
                </Suspense>
              </Layout>
            </ActivateChainRequest>
          </AccessRequest>
        </Lock>
      );
    }
  }

  return null;
}

function isCosSignDirect(queue: Queue): queue is Queue<CosSignDirect> {
  return queue?.message?.method === 'cos_signDirect' || queue?.message?.method === 'ten_signDirect';
}
