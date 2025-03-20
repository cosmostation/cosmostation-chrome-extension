import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-assets/import/nft/')({
  component: ImportNFT,
});

function ImportNFT() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
