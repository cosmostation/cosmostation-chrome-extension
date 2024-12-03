import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/coin-detail/')({
  component: CoinDetail,
});

function CoinDetail() {
  // TODO useParams로 코인 아이디 props로 전달 필요.
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
