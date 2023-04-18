import { Typography } from '@mui/material';
import type { TransactionBlock } from '@mysten/sui.js';

import { Container } from './styled';

type TxProps = {
  transactionBlock: TransactionBlock;
};

export default function Tx({ transactionBlock }: TxProps) {
  return (
    <Container>
      <Typography variant="h6">{JSON.stringify(transactionBlock.blockData, null, 4)}</Typography>
    </Container>
  );
}
