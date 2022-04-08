import YAML from 'js-yaml';
import { Typography } from '@mui/material';

import type { Msg, MsgCustom } from '~/types/tendermint/amino';

import { ContentContainer } from './styled';
import Container from '../../components/Container';

type CustomProps = { msg: Msg<MsgCustom> };

export default function Custom({ msg }: CustomProps) {
  const { type, value } = msg;
  const doc = YAML.dump({ type, value }, { indent: 4 });

  return (
    <Container title="Custom">
      <ContentContainer>
        <Typography variant="h6">{doc}</Typography>
      </ContentContainer>
    </Container>
  );
}
