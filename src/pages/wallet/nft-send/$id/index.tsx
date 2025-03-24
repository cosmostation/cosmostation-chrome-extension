import { createFileRoute } from '@tanstack/react-router';

import Entry from './-Entry';
import Layout from './-layout';

export const Route = createFileRoute('/wallet/nft-send/$id/')({
  component: NFTSend,
});

function NFTSend() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry id={params.id} />
    </Layout>
  );
}
