import { Typography } from '@mui/material';

interface LayoutProps {
  children: JSX.Element;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <Typography variant="h1">dashboard layout</Typography>
      {children}
    </div>
  );
}
