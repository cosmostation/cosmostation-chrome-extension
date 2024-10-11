import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/')({
  component: Index,
  errorComponent: () => <div>Failed to load</div>,
});

function Index() {
  Buffer.from('Hello from Index!').toString('base64');
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  );
}
