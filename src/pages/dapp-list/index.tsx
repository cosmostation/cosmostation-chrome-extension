import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/dapp-list/')({
  component: DappList,
});

function DappList() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
