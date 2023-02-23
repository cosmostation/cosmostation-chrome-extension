import YAML from 'js-yaml';
import { Typography } from '@mui/material';

import type { Msg } from '~/types/cosmos/proto';

import { ContentContainer } from './styled';
import Container from '../../components/Container';

type CustomProps = { msg: Msg; isMultipleMsgs: boolean };

export default function Custom({ msg, isMultipleMsgs }: CustomProps) {
  const doc = YAML.dump(msg, { indent: 4 });

  return (
    <Container title="Custom" isMultipleMsgs={isMultipleMsgs}>
      <ContentContainer>
        <Typography variant="h6">{doc}</Typography>
      </ContentContainer>
    </Container>
  );
}
