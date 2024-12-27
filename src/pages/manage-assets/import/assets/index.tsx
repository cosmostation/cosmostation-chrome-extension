import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-assets/import/assets/')({
  component: ImportTokens,
});

function ImportTokens() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
