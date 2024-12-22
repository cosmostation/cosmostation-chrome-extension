import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-assets/visibility/assets/')({
  component: ManageAssets,
});

function ManageAssets() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
