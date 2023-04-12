import { Typography } from '@mui/material';

import { Container } from './styled';

type TxProps = {
  transactionData: Record<string | number, unknown>;
};

export default function Tx({ transactionData }: TxProps) {
  return (
    <Container>
      <Typography variant="h6">{JSON.stringify(transactionData, null, 4)}</Typography>
    </Container>
  );
}
