import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/wallet/receive/')({
  component: SelectReceiveCoin,
});

function SelectReceiveCoin() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
