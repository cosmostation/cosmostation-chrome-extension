import { TENDERMINT_CHAINS } from '~/constants/chain';
import AccessRequest from '~/Popup/components/AccessRequest';
import ActivateChainRequest from '~/Popup/components/ActivateChainRequest';
import Lock from '~/Popup/components/Lock';
import { useCurrentAdditionalChains } from '~/Popup/hooks/useCurrent/useCurrentAdditionalChains';
import { useCurrentQueue } from '~/Popup/hooks/useCurrent/useCurrentQueue';
import type { Queue } from '~/types/chromeStorage';
import type { TenSignAmino } from '~/types/tendermint/message';

import Entry from './entry';
import Layout from './layout';

export default function AddChain() {
  const { currentQueue } = useCurrentQueue();
  const { currentTendermintAdditionalChains } = useCurrentAdditionalChains();

  if (currentQueue && isTenSignAmino(currentQueue)) {
    const selecteChain = [...TENDERMINT_CHAINS, ...currentTendermintAdditionalChains].find((item) => item.chainName === currentQueue.message.params.chainName);

    if (selecteChain) {
      return (
        <Lock>
          <AccessRequest>
            <ActivateChainRequest>
              <Layout>
                <Entry queue={currentQueue} chain={selecteChain} />
              </Layout>
            </ActivateChainRequest>
          </AccessRequest>
        </Lock>
      );
    }
  }

  return null;
}

function isTenSignAmino(queue: Queue): queue is Queue<TenSignAmino> {
  return queue?.message?.method === 'ten_signAmino';
}
