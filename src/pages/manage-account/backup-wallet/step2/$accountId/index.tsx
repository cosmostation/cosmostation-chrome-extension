import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/backup-wallet/step2/$accountId/')({
  component: ManageBackupStep2,
});

function ManageBackupStep2() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry accountId={params.accountId} />
    </Layout>
  );
}
