import { lazy, Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';

import EntrySkeleton from './-entry-skeleton';
import Layout from './-layout';

const Entry = lazy(() => import('./-entry'));

export const Route = createFileRoute('/manage-account/view/multi-chain-priateKey/$accountId/')({
  component: MultiChainPrivateKey,
});

function MultiChainPrivateKey() {
  const params = Route.useParams();

  return (
    <Layout accountId={params.accountId}>
      <Suspense fallback={<EntrySkeleton />}>
        <Entry accountId={params.accountId} />
      </Suspense>
    </Layout>
  );
}
