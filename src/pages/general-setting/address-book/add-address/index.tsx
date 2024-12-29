import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/general-setting/address-book/add-address/')({
  component: AddAddress,
});

function AddAddress() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
