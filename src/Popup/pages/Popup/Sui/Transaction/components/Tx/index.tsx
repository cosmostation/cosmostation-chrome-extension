import { Typography } from '@mui/material';
import type { UnserializedSignableTransaction } from '@mysten/sui.js';

import { Container } from './styled';

type TxProps = {
  transaction: UnserializedSignableTransaction;
};

export default function Tx({ transaction }: TxProps) {
  return (
    <Container>
      <Typography variant="h6">{JSON.stringify(transaction, null, 4)}</Typography>
    </Container>
  );
}
