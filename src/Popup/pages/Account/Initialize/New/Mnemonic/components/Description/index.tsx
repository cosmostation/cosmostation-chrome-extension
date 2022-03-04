import { Typography } from '@mui/material';

import { Container } from './styled';

type DescriptionProps = {
  children?: string;
};

export default function Description({ children }: DescriptionProps) {
  return (
    <Container>
      <Typography variant="h5">{children}</Typography>
    </Container>
  );
}
