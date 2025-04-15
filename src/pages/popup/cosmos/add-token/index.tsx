import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import type { RequestQueue } from '@/types/extension';
import type { CosAddTokensCW20Internal } from '@/types/message/inject/cosmos';
import { isEqualsIgnoringCase } from '@/utils/string';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/cosmos/add-token/')({
  component: CosmosAddToken,
});

function CosmosAddToken() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  if (currentRequestQueue && isCosAddTokens(currentRequestQueue)) {
    const selectedAsset = accountAllAssets?.allCosmosAccountAssets.find((asset) =>
      isEqualsIgnoringCase(asset.chain.name, currentRequestQueue.params.chainName),
    );

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

function isCosAddTokens(queue: RequestQueue): queue is CosAddTokensCW20Internal {
  return queue.method === 'cos_addTokensCW20Internal';
}
