import { createFileRoute } from '@tanstack/react-router';

import Header from '@/components/Header';

import { Container } from './-styled';

export const Route = createFileRoute('/account/add/')({
  component: CreateAccount,
});

function CreateAccount() {
  // const { t } = useTranslation()

  return (
    <Container>
      <Header />
    </Container>
  );
}
