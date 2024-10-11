import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/search')({
  component: Search,
});

function Search() {
  const aaa = Route.useSearch();

  console.log('🚀 ~ Search ~ aaa:', aaa);

  return (
    <div>
      <h1>search</h1>
    </div>
  );
}
