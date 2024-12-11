import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/view/privateKey/$accountId/')({
  component: ViewPrivateKey,
});

function ViewPrivateKey() {
  const params = Route.useParams();

  return (
    <Layout accountId={params.accountId}>
      <Entry accountId={params.accountId} />
    </Layout>
  );
}
