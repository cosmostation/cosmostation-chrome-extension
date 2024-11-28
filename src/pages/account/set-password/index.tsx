import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/account/set-password/')({
  component: SetPassword,
});

function SetPassword() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
