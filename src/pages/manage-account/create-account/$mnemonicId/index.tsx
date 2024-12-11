import { createFileRoute } from '@tanstack/react-router';

import Lock from '@/components/Lock';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/create-account/$mnemonicId/')({
  component: CreateAccountWithExistMnemonic,
});

function CreateAccountWithExistMnemonic() {
  const params = Route.useParams();

  return (
    <Lock>
      <Layout>
        <Entry mnemonicId={params.mnemonicId} />
      </Layout>
    </Lock>
  );
}
