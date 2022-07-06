import YAML from 'js-yaml';
import { Typography } from '@mui/material';

import type { Msg } from '~/types/cosmos/proto';

import { ContentContainer } from './styled';
import Container from '../../components/Container';

type CustomProps = { msg: Msg };

export default function Custom({ msg }: CustomProps) {
  const doc = YAML.dump(msg, { indent: 4 });

  return (
    <Container title="Custom">
      <ContentContainer>
        <Typography variant="h6">{doc}</Typography>
      </ContentContainer>
    </Container>
  );
}
