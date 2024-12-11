import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/coin-detail/$coinId/')({
  component: CoinDetail,
});

function CoinDetail() {
  const { coinId } = Route.useParams();
  // TODO useParams로 코인 아이디 props로 전달 필요.
  return (
    <Layout>
      <Entry coinId={coinId} />
    </Layout>
  );
}
