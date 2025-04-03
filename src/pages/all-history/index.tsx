import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/all-history/')({
  component: AllHistory,
});

function AllHistory() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
