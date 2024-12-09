import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/detail/mnemonic/')({
  component: MnemonicDetail,
});

function MnemonicDetail() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
