import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/popup/cosmos/sign/')({
  component: CosmosSign,
});

function CosmosSign() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
