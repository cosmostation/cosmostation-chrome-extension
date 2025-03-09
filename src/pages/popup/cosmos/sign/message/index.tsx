import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import AccessRequest from '@/pages/popup/-components/requests/AccessRequest';
import type { RequestQueue } from '@/types/extension';
import type { CosSignMessage } from '@/types/message/inject/cosmos';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/popup/cosmos/sign/message/')({
  component: CosmosSignMessage,
});

function CosmosSignMessage() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  if (currentRequestQueue && isCosSignMessage(currentRequestQueue)) {
    // NOTE 카바케이스를 위해서 비트코인처럼 accountType필터링 필요.
    const selectedAsset = accountAllAssets?.allCosmosAccountAssets.find((asset) => asset.chain.name === currentRequestQueue.params.chainName);

    if (selectedAsset?.chain) {
      return (
        <AccessRequest>
          <Layout>
            <Entry request={currentRequestQueue} chain={selectedAsset.chain} />
          </Layout>
        </AccessRequest>
      );
    }
  }
  return null;
}

function isCosSignMessage(queue: RequestQueue): queue is CosSignMessage {
  return queue.method === 'cos_signMessage';
}
