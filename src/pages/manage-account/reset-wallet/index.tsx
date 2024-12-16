import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/reset-wallet/')({
  component: ResetWallet,
});

function ResetWallet() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
