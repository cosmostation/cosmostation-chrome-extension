import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';
import Layout from './-layout';

export const Route = createFileRoute('/general-setting/about/')({
  component: About,
});

function About() {
  return (
    <Layout>
      <Entry />
    </Layout>
  );
}
