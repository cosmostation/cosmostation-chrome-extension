import { createFileRoute } from '@tanstack/react-router';

import Test from '@components/test';

export const Route = createFileRoute('/about')({
  component: Test,
});
