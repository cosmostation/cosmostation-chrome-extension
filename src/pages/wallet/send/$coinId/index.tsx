import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/wallet/send/$coinId/')({
  component: Send,
});

function Send() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry coinId={params.coinId} />
    </Layout>
  );
}
