import { Typography } from '@mui/material';

import { Container } from './styled';

interface LayoutProps {
  children: JSX.Element;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Container>
      <Typography variant="h4n_M">dashboard layout</Typography>
      <Typography variant="h1_B">dashboard layout</Typography>
      {children}
    </Container>
  );
}
