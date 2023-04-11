import { Typography } from '@mui/material';

import { Container } from './styled';

type TxProps = {
  transaction: Record<string | number, unknown>;
};

export default function Tx({ transaction }: TxProps) {
  return (
    <Container>
      <Typography variant="h6">{JSON.stringify(transaction, null, 4)}</Typography>
    </Container>
  );
}
