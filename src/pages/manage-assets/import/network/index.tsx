import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-assets/import/network/')({
  component: ImportCustomNetwork,
});

function ImportCustomNetwork() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
