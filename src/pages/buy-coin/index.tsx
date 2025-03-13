import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/buy-coin/')({
  component: BuyCoin,
});

function BuyCoin() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
