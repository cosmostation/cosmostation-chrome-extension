import { createFileRoute } from '@tanstack/react-router';

import Entry from './-Entry';
import Layout from './-Layout';

export const Route = createFileRoute('/wallet/stake/$coinId/')({
  component: Stake,
});

function Stake() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry coinId={params.coinId} />
    </Layout>
  );
}
