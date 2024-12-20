import { createFileRoute } from '@tanstack/react-router';

import Entry from './-Entry';
import Layout from './-layout';

export const Route = createFileRoute('/wallet/claim-rewards/$coinId/$validatorAddress/')({
  component: ClaimRewards,
});

function ClaimRewards() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry coinId={params.coinId} validatorAddress={params.validatorAddress} />
    </Layout>
  );
}
