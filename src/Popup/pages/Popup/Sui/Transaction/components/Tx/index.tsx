import { Typography } from '@mui/material';
import type { Transaction } from '@mysten/sui/transactions';

import { Container } from './styled';

type TxProps = {
  transaction: Transaction;
};

export default function Tx({ transaction }: TxProps) {
  return (
    <Container>
      <Typography variant="h6">{JSON.stringify(transaction.getData(), null, 4)}</Typography>
    </Container>
  );
}
