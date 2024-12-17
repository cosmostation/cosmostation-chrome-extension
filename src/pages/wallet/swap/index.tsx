import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/wallet/swap/')({
  component: SelectSwapCoin,
});

function SelectSwapCoin() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
