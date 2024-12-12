import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/wallet/send/')({
  component: SelectSendCoin,
});

function SelectSendCoin() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
