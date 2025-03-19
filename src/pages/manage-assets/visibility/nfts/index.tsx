import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-assets/visibility/nfts/')({
  component: MangeNFTs,
});

function MangeNFTs() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
