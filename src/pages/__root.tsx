import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import Wrapper from '@/components/Wrapper';

export const Route = createRootRoute({
  component: () => (
    <Wrapper>
      <>
        <Outlet />
        <TanStackRouterDevtools />
      </>
    </Wrapper>
  ),
});
