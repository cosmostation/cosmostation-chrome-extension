import { Typography } from '@mui/material';

import { toHex } from '~/Popup/utils/string';
import type { EthereumTx } from '~/types/message/ethereum';

import { Container } from './styled';

type ContainerProps = {
  tx: EthereumTx;
};

export default function Tx({ tx }: ContainerProps) {
  const modifyTx = {
    ...tx,
    nonce: tx.nonce !== undefined ? toHex(tx.nonce, { addPrefix: true }) : undefined,
  };

  return (
    <Container>
      <Typography variant="h6">{JSON.stringify(modifyTx, null, 4)}</Typography>
    </Container>
  );
}
