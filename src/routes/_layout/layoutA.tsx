import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/layoutA')({
  component: Comp,
});

function Comp(params: string) {
  return <div>{params}</div>;
}
