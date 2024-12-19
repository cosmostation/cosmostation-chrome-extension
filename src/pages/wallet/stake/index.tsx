import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/wallet/stake/')({
  component: SelectStakingCoin,
});

function SelectStakingCoin() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
