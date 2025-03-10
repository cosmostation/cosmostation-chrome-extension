import { createFileRoute } from '@tanstack/react-router';

import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import type { RequestQueue } from '@/types/extension';
import type { CosRequestAddChain } from '@/types/message/inject/cosmos';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/cosmos/add-chain/')({
  component: CosmosAddChain,
});

function CosmosAddChain() {
  const { currentRequestQueue } = useCurrentRequestQueue();

  if (currentRequestQueue && isCosAddChain(currentRequestQueue)) {
    return (
      <AccessRequest>
        <Layout>
          <Entry request={currentRequestQueue} />
        </Layout>
      </AccessRequest>
    );
  }
  return null;
}

function isCosAddChain(queue: RequestQueue): queue is CosRequestAddChain {
  return queue.method === 'cos_addChain';
}
