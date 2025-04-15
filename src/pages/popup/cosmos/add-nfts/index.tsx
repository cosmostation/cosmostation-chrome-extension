import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import type { RequestQueue } from '@/types/extension';
import type { CosAddNFTsCW721 } from '@/types/message/inject/cosmos';
import { isEqualsIgnoringCase } from '@/utils/string';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/cosmos/add-nfts/')({
  component: CosmosAddNFTs,
});

function CosmosAddNFTs() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
    disableDupeEthermint: true,
  });

  if (currentRequestQueue && isCosAddNFTs(currentRequestQueue)) {
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

function isCosAddNFTs(queue: RequestQueue): queue is CosAddNFTsCW721 {
  return queue.method === 'cos_addNFTsCW721';
}
