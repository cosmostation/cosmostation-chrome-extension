import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/manage-wallet-and-account/')({
  component: ManageWalletAndAccount,
});

function ManageWalletAndAccount() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
