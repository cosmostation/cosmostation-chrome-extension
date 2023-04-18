import YAML from 'js-yaml';
import { Typography } from '@mui/material';
import type { TransactionBlock } from '@mysten/sui.js';

import { ContentContainer } from './styled';
import Container from '../../components/Container';

type TransactionProps = {
  transactionBlock: TransactionBlock;
};

export default function Transaction({ transactionBlock }: TransactionProps) {
  const doc = YAML.dump(transactionBlock.blockData, { indent: 4 });

  return (
    <Container title="Transaction">
      <ContentContainer>
        <Typography variant="h6">{doc}</Typography>
      </ContentContainer>
    </Container>
  );
}
