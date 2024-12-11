import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/view/multi-chain-priateKey/$accountId/')({
  component: MultiChainPrivateKey,
});

function MultiChainPrivateKey() {
  const params = Route.useParams();

  return (
    <Layout accountId={params.accountId}>
      <Entry accountId={params.accountId} />
    </Layout>
  );
}
