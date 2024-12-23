import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/create-account/$mnemonicId/')({
  component: CreateAccountWithExistMnemonic,
});

function CreateAccountWithExistMnemonic() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry mnemonicId={params.mnemonicId} />
    </Layout>
  );
}
