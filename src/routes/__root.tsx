import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import NotFound from '../pages/NotFound';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  // notFoundComponent: () => <Navigate to={'/'} />,
  notFoundComponent: NotFound,
});

// NOTE 해시 라우팅?
// NOTE 저장 시 import영역 정렬이 안되는건 린트 설정이 원인?
