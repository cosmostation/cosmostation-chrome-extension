import { Typography } from '@mui/material';

import { Container, TextContainer } from './styled';

type RequestMethodTitleProps = {
  title: string;
};

export default function RequestMethodTitle({ title }: RequestMethodTitleProps) {
  return (
    <Container>
      <TextContainer>
        <Typography variant="h3_B">{title}</Typography>
      </TextContainer>
    </Container>
  );
}
