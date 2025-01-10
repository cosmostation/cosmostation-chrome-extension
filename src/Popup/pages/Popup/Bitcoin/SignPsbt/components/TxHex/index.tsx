import { Typography } from '@mui/material';

import { Container } from './styled';

type TxHexProps = {
  txHex: string;
};

export default function Tx({ txHex }: TxHexProps) {
  return (
    <Container>
      <Typography variant="h6">{txHex}</Typography>
    </Container>
  );
}
