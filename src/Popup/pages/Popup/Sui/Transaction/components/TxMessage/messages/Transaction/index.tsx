import YAML from 'js-yaml';
import { Typography } from '@mui/material';
import type { TransactionBlock } from '@mysten/sui.js';

import { ContentContainer } from './styled';
import Container from '../../components/Container';

type TransactionProps = {
  transaction: TransactionBlock | string;
};
// NOTE base64로 바꿔먹지 return toB64(new Uint8Array(arg as number[]));
//
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
