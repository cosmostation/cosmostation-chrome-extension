import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/account/restore-wallet/mnemonic/')({
  component: RestoreWalletWithMnemonic,
});

function RestoreWalletWithMnemonic() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
