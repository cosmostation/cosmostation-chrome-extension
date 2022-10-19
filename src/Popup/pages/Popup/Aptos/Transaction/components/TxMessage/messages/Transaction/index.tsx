import YAML from 'js-yaml';
import { Typography } from '@mui/material';

import type { AptosSignPayload } from '~/types/message/aptos';

import { ContentContainer } from './styled';
import Container from '../../components/Container';

type TransactionProps = {
  payload: AptosSignPayload;
};

export default function Transaction({ payload }: TransactionProps) {
  const { arguments: payloadArguments, function: payloadFunction, type, type_arguments } = payload;

  const doc = YAML.dump({ function: payloadFunction, arguments: payloadArguments, type_arguments, type }, { indent: 4 });

  return (
    <Container title="Transaction">
      <ContentContainer>
        <Typography variant="h6">{doc}</Typography>
      </ContentContainer>
    </Container>
  );
}
