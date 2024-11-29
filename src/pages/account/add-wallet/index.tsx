import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/account/add-wallet/')({
  component: AddWallet,
});

function AddWallet() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
