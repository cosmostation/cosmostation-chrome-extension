import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/switch-wallet/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello /switch-wallet/!</div>;
}
