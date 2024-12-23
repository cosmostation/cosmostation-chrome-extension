import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/account/backup-check/$accountId/')({
  component: BackupCheck,
});

function BackupCheck() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
