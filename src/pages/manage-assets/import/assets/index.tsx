import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/manage-assets/import/assets/')({
  component: RouteComponent,
});
// NOTE erc20, cw20 토큰 추가, 현재 지원하는 체인에 한해서만 추가 가능하도록 제한
function RouteComponent() {
  return <div>Hello &quot;/manage-assets/import/assets/&quot;!</div>;
}
