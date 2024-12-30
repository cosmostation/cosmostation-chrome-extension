import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/cosmos/sign/')({
  component: CosmosSign,
});

function CosmosSign() {
  return (
    <AccessRequest>
      <Layout>
        <Entry />
      </Layout>
    </AccessRequest>
  );
}
