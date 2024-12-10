import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/detail/mnemonic/$mnemonicId/')({
  component: MnemonicDetail,
});

function MnemonicDetail() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry mnemonicId={params.mnemonicId} />
    </Layout>
  );
}
