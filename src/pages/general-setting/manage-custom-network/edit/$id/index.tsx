import { createFileRoute } from '@tanstack/react-router';

import Entry from './-Entry';
import Layout from './-layout';

export const Route = createFileRoute('/general-setting/manage-custom-network/edit/$id/')({
  component: EditCustomNetwork,
});

function EditCustomNetwork() {
  const params = Route.useParams();

  return (
    <Layout id={params.id}>
      <Entry id={params.id} />
    </Layout>
  );
}
