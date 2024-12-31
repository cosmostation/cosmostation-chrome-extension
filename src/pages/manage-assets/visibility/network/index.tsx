import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-assets/visibility/network/')({
  component: ManageCustomNetwork,
});

function ManageCustomNetwork() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
