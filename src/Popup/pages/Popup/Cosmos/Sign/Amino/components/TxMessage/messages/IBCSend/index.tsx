import YAML from 'js-yaml';
import { Typography } from '@mui/material';

import type { Msg, MsgTransfer } from '~/types/cosmos/amino';

import { ContentContainer } from './styled';
import Container from '../../components/Container';

type IBCSendProps = { msg: Msg<MsgTransfer> };

export default function IBCSend({ msg }: IBCSendProps) {
  const { type, value } = msg;
  const doc = YAML.dump({ type, value }, { indent: 4 });
  // TODO send 페이지 처럼 꾸미기
  return (
    <Container title="IBC Send">
      <ContentContainer>
        <Typography variant="h6">{doc}</Typography>
      </ContentContainer>
    </Container>
  );
}
