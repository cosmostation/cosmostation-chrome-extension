import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/view/mnemonic/')({
  component: ViewMnemonic,
});

function ViewMnemonic() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
