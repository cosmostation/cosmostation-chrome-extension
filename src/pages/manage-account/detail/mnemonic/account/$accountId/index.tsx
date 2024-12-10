import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/detail/mnemonic/account/$accountId/')({
  component: MnemonicAccountDetail,
});

function MnemonicAccountDetail() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry accountId={params.accountId} />
    </Layout>
  );
}
