import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import NotFound from '../pages/NotFound';

export const Route = createRootRoute({
  component: RootComponent,
  // NOTE notFoundComponent: () => <Navigate to={'/'} />,
  notFoundComponent: NotFound,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      <TanStackRouterDevtools />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      {/* <ScrollRestoration />
        <Scripts /> */}
    </div>
  );
}
