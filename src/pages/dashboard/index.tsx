import { createFileRoute } from '@tanstack/react-router';
import Layout from './-components/-layout';

export const Route = createFileRoute('/dashboard/')({
  component: () => (
    <Layout>
      <Dashboard />
    </Layout>
  ),
});

function Dashboard() {
  return <div>dashboard mainPage</div>;
}
