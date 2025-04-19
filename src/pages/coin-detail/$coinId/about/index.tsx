import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/coin-detail/$coinId/about/')({
  component: CoinAbout,
});

function CoinAbout() {
  const params = Route.useParams();

  return (
    <Layout coinId={params.coinId}>
      <Entry coinId={params.coinId} />
    </Layout>
  );
}
