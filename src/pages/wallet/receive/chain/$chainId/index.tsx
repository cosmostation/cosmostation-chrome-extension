import { createFileRoute } from '@tanstack/react-router';

import type { UniqueChainId } from '@/types/chain';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/wallet/receive/chain/$chainId/')({
  component: ReceiveWithChainId,
});

function ReceiveWithChainId() {
  const params = Route.useParams();
  return (
    <Layout>
      <Entry chainId={params.chainId as UniqueChainId} />
    </Layout>
  );
}
