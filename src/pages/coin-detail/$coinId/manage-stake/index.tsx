import { createFileRoute } from '@tanstack/react-router';

import Entry from './-Entry';
import Layout from './-layout';

export const Route = createFileRoute('/coin-detail/$coinId/manage-stake/')({
  component: ManageStake,
});

function ManageStake() {
  const params = Route.useParams();

  return (
    <Layout coinId={params.coinId}>
      <Entry coinId={params.coinId} />
    </Layout>
  );
}
