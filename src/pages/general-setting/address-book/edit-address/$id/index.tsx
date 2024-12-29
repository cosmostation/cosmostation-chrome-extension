import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/general-setting/address-book/edit-address/$id/')({
  component: EditAddress,
});

function EditAddress() {
  const param = Route.useParams();

  return (
    <Layout>
      <Entry id={param.id} />
    </Layout>
  );
}
