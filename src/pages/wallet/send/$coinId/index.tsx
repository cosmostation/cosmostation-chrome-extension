import { createFileRoute } from '@tanstack/react-router';

import Layout from './-layout';
import Entry from './-Entry';

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
