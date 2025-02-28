import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import AccessRequest from '@/pages/popup/-components/requests/AccessRequest';
import type { RequestQueue } from '@/types/extension';
import type { CosSignAmino } from '@/types/message/inject/cosmos';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/popup/cosmos/sign/amino/')({
  component: CosmosSignAmino,
});

function CosmosSignAmino() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  if (currentRequestQueue && isCosSignAmino(currentRequestQueue)) {
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

function isCosSignAmino(queue: RequestQueue): queue is CosSignAmino {
  return queue.method === 'cos_signAmino';
}
