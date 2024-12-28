import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/general-setting/address-book/')({
  component: AddressBook,
});

function AddressBook() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
