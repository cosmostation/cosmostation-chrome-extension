import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/wallet/tx-result/$txHash/$coinId/')({
  component: TxResult,
});

function TxResult() {
  const params = Route.useParams();

  const { txHash, coinId } = params;

  return (
    <Layout>
      <Entry coinId={coinId} txHash={txHash} />
    </Layout>
  );
}
