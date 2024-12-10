import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/detail/mnemonic/account/')({
  component: MnemonicAccountDetail,
});

function MnemonicAccountDetail() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
