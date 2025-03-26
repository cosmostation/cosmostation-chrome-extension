import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/general-setting/backup-wallet/')({
  component: BackupWallet,
});

function BackupWallet() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
