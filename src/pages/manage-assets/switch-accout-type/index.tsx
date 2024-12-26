import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/manage-assets/switch-accout-type/')({
  component: SwitchAccountType,
});

function SwitchAccountType() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
