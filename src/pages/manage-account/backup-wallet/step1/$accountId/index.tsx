import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

type ManageBackupStep1SearchParams = {
  backupCompleted?: boolean;
};

export const Route = createFileRoute('/manage-account/backup-wallet/step1/$accountId/')({
  component: ManageBackupStep1,
  validateSearch: (search?: ManageBackupStep1SearchParams): ManageBackupStep1SearchParams => {
    return {
      backupCompleted: search?.backupCompleted,
    };
  },
});

function ManageBackupStep1() {
  const params = Route.useParams();

  const searchParam = Route.useSearch();
  const { backupCompleted } = searchParam;
  return (
    <Layout>
      <Entry accountId={params.accountId} isBackupCompleted={backupCompleted} />
    </Layout>
  );
}
