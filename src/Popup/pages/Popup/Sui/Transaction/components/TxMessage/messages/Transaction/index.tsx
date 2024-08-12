import YAML from 'js-yaml';
import { Typography } from '@mui/material';
import type { Transaction as TransactionType } from '@mysten/sui/transactions';

import { ContentContainer } from './styled';
import Container from '../../components/Container';

type TransactionProps = {
  transaction: TransactionType;
};

export default function Transaction({ transaction }: TransactionProps) {
  const doc = YAML.dump(transaction.getData(), { indent: 4 });

  return (
    <Container title="Transaction">
      <ContentContainer>
        <Typography variant="h6">{doc}</Typography>
      </ContentContainer>
    </Container>
  );
}
