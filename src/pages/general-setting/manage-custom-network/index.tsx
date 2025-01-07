import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/general-setting/manage-custom-network/')({
  component: ManageCustomNetwork,
});

function ManageCustomNetwork() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
