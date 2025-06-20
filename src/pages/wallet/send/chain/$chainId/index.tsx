import { createFileRoute } from '@tanstack/react-router';

import type { UniqueChainId } from '@/types/chain';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/wallet/send/chain/$chainId/')({
  component: SendCoinWithChainId,
});

function SendCoinWithChainId() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry chainId={params.chainId as UniqueChainId} />
    </Layout>
  );
}
