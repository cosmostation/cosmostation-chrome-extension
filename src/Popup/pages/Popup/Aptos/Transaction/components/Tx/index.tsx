import { Typography } from '@mui/material';

import type { AptosSignPayload } from '~/types/message/aptos';

import { Container } from './styled';

type ContainerProps = {
  payload: AptosSignPayload;
};

export default function Tx({ payload }: ContainerProps) {
  return (
    <Container>
      <Typography variant="h6">{JSON.stringify(payload, null, 4)}</Typography>
    </Container>
  );
}
