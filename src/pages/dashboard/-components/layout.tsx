import { Typography } from '@mui/material';

import { Container } from './styled';

interface LayoutProps {
  children: JSX.Element;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Container>
      <Typography variant="h9">dashboard layout</Typography>
      {/* <Typography variant="h3">dashboard layout</Typography> */}
      {children}
    </Container>
  );
}
