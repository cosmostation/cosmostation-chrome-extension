import { Typography } from '@mui/material';

import { Container } from './styled';

type ContainerProps = {
  tx: Record<string | number, unknown>;
};

export default function Tx({ tx }: ContainerProps) {
  return (
    <Container>
      <Typography variant="h6">{JSON.stringify(tx, null, 4)}</Typography>
    </Container>
  );
}
