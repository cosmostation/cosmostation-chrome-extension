import { Typography } from '@mui/material';

import type { Msg, MsgSignData } from '~/types/cosmos/amino';

import { ContentContainer } from './styled';
import Container from '../../components/Container';

type CustomProps = { msg: Msg<MsgSignData> };

export default function Message({ msg }: CustomProps) {
  const { value } = msg;

  const { data } = value;

  const message = Buffer.from(data, 'base64').toString('utf8');

  return (
    <Container title="Message">
      <ContentContainer>
        <Typography variant="h6">{message}</Typography>
      </ContentContainer>
    </Container>
  );
}
