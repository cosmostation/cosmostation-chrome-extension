import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-assets/coin-type-setting/')({
  component: CoinTypeSetting,
});

function CoinTypeSetting() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
