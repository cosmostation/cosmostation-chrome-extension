import { createFileRoute } from '@tanstack/react-router';

import AccountInitializer from './-components/AccountInitializer';
import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <AccountInitializer>
      <Layout>
        <Entry />
      </Layout>
    </AccountInitializer>
  );
}
