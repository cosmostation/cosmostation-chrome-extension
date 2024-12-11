import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/detail/privateKey/account/$accountId/')({
  component: PrivateKeyAccountDetail,
});

function PrivateKeyAccountDetail() {
  const params = Route.useParams();

  return (
    <Layout>
      <Entry accountId={params.accountId} />
    </Layout>
  );
}
