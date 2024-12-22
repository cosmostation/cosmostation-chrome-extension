import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/manage-assets/import/network/')({
  component: RouteComponent,
});

// NOTE 체인 추가 시 기본 메인 코인은 visible도 같이 추가되도록 작업.
function RouteComponent() {
  return <div>Hello &quot;/manage-assets/import/network/&quot;!</div>;
}
