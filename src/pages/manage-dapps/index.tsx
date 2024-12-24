import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-dapps/')({
  component: ManageDapps,
});

function ManageDapps() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
