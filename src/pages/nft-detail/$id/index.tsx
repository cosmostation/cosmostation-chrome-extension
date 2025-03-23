import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/nft-detail/$id/')({
  component: NFTDetail,
});

function NFTDetail() {
  const { id } = Route.useParams();

  return (
    <Layout>
      <Entry id={id} />
    </Layout>
  );
}
