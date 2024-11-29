import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/account/add-wallet/')({
  component: CreateAccount,
});

function CreateAccount() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
