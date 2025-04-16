import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import Wrapper from '@/components/Wrapper';

import Error from './-error';
import NotFound from './-notFound';

export const Route = createRootRoute({
  component: () => (
    <Wrapper>
      <>
        <Outlet />
        {__APP_MODE__ === 'development' && <TanStackRouterDevtools />}
      </>
    </Wrapper>
  ),
  errorComponent: ({ error, reset }) => {
    return <Error error={error} reset={reset} />;
  },
  notFoundComponent: () => {
    return <NotFound />;
  },
});
