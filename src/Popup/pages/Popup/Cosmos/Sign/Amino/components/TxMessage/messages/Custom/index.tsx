import YAML from 'js-yaml';
import { Typography } from '@mui/material';

import type { Msg, MsgCustom } from '~/types/cosmos/amino';

import { ContentContainer } from './styled';
import Container from '../../components/Container';

type CustomProps = { msg: Msg<MsgCustom>; isMultipleMsgs: boolean };

export default function Custom({ msg, isMultipleMsgs }: CustomProps) {
  const { type, value } = msg;
  const doc = YAML.dump({ type, value }, { indent: 4 });

  return (
    <Container title="Custom" isMultipleMsgs={isMultipleMsgs}>
      <ContentContainer>
        <Typography variant="h6">{doc}</Typography>
      </ContentContainer>
    </Container>
  );
}
