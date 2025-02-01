import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';
import AccessRequest from '../-components/requests/AccessRequest';

export const Route = createFileRoute('/popup/request-account/')({
  component: RequestAccount,
});

function RequestAccount() {
  return (
    <AccessRequest>
      <Layout>
        <Entry />
      </Layout>
    </AccessRequest>
  );
}
