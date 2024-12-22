import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/manage-assets/visibility/network/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello &quot;/manage-assets/visibility/network/&quot;!</div>;
}
