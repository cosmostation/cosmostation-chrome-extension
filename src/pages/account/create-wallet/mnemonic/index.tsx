import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/account/create-wallet/mnemonic/')({
  component: CreateMnemonic,
});

function CreateMnemonic() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
