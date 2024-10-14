import { createFileRoute } from '@tanstack/react-router';

import Card from './-components/Card';
import Layout from './-layout';
import { Container } from './-styled';

export const Route = createFileRoute('/dashboard/')({
  component: () => (
    // NOTE 레이아웃 컴포넌트를 여기에서 랩핑할건지 밑에서 랩핑할건지 결정필요.
    <Layout>
      <Dashboard />
    </Layout>
  ),
});

function Dashboard() {
  return (
    <Container>
      dashboard mainPage
      <Card />
    </Container>
  );
}
