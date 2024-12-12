import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/backup-wallet/step1/$accountId/')({
  component: ManageBackupStep1,
});

function ManageBackupStep1() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry accountId={params.accountId} />
    </Layout>
  );
}
