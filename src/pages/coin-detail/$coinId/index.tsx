import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/coin-detail/$coinId/')({
  component: CoinDetail,
});

function CoinDetail() {
  const { coinId } = Route.useParams();

  return (
    <Layout coinId={coinId}>
      <Entry coinId={coinId} />
    </Layout>
  );
}
