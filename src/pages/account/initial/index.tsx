import { createFileRoute } from '@tanstack/react-router';

import Entry from './-entry';

export const Route = createFileRoute('/account/initial/')({
  component: Initial,
});

function Initial() {
  return <Entry />;
}
