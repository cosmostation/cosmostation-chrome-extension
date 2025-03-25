import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/general-setting/wallet-prioritize/')({
  component: WalletPrioritize,
});

function WalletPrioritize() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
