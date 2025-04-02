import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/view/mnemonic/$mnemonicId/')({
  component: ViewMnemonic,
});

function ViewMnemonic() {
  const params = Route.useParams();

  return (
    <Layout mnemonicId={params.mnemonicId}>
      <Entry mnemonicId={params.mnemonicId} />
    </Layout>
  );
}
