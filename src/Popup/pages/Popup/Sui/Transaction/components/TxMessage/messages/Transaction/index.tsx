import YAML from 'js-yaml';
import { Typography } from '@mui/material';
import type { UnserializedSignableTransaction } from '@mysten/sui.js';

import { ContentContainer } from './styled';
import Container from '../../components/Container';

type TransactionProps = {
  transaction: UnserializedSignableTransaction | string;
};

export default function Transaction({ transaction }: TransactionProps) {
  const doc = YAML.dump(transaction, { indent: 4 });

  return (
    <Container title="Transaction">
      <ContentContainer>
        <Typography variant="h6">{doc}</Typography>
      </ContentContainer>
    </Container>
  );
}
