import { styled } from '@mui/material/styles';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

import { theme } from '@/styles/theme';

export const Route = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
      <TanStackRouterDevtools />
    </Layout>
  ),
});

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <Wrapper>
      <RootContainer>{children}</RootContainer>
    </Wrapper>
  );
}

// TODO 네이밍 적절한걸로 변경 필요
export const Wrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.palette.color.base1000,
}));

export const RootContainer = styled('div')({
  width: '100%',
  maxWidth: '55rem',
  minWidth: '36rem',
  height: '100vh',
  minHeight: '60rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',

  backgroundColor: theme.palette.color.base300,
});
