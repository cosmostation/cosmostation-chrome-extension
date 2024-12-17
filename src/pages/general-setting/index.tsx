import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/general-setting/')({
  component: GeneralSetting,
});

function GeneralSetting() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
