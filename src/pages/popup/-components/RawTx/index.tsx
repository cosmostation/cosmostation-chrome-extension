import { Typography } from '@mui/material';

import { Container } from './styled';

type ContainerProps = {
  tx: Record<string | number, unknown>;
};

export default function RawTx({ tx }: ContainerProps) {
  return (
    <Container>
      <Typography variant="b3_M">{JSON.stringify(tx, null, 4)}</Typography>
    </Container>
  );
}
