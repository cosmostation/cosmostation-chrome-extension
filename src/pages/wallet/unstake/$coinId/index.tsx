import { createFileRoute } from '@tanstack/react-router';

import Entry from './-Entry';
import Layout from './-Layout';

export const Route = createFileRoute('/wallet/unstake/$coinId/')({
  component: Unstake,
});

function Unstake() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry coinId={params.coinId} validatorAddress="" />
    </Layout>
  );
}
