import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/account/restore-wallet/privatekey/')({
  component: RestoreWalletWithPrivateKey,
});

function RestoreWalletWithPrivateKey() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
