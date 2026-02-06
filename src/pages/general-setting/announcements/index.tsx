import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/general-setting/announcements/')({
  component: Announcements,
});

function Announcements() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
