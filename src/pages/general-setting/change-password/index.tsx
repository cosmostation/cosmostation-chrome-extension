import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/general-setting/change-password/')({
  component: ChangePassword,
});

function ChangePassword() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
