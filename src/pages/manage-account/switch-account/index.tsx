import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-account/switch-account/')({
  component: SwitchAccount,
});

function SwitchAccount() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
