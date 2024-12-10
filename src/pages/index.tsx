import { createFileRoute } from '@tanstack/react-router';

import Lock from '@/components/Lock';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/')({
  component: Index,
  errorComponent: () => <div>Failed to load</div>,
});

function Index() {
  return (
    <Lock>
      <Layout>
        <Entry />
      </Layout>
    </Lock>
  );
}
