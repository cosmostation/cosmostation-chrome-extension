import { Typography } from '@mui/material';

import { Container, IconContainer, TextContainer } from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type WarningContainerProps = {
  message: string;
};

export default function WarningContainer({ message }: WarningContainerProps) {
  return (
    <Container>
      <IconContainer>
        <Info16Icon />
      </IconContainer>
      <TextContainer>
        <Typography variant="h6">{message}</Typography>
      </TextContainer>
    </Container>
  );
}
