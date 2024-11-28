import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/account/initial/')({
  component: Initial,
});

function Initial() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
