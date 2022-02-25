import { Typography } from '@mui/material';

import { Container, ImageContainer, TextContainer } from './styled';

import Info16Icon from '~/images/icons/Info16.svg';

type DescriptionProps = {
  children?: string;
};

export default function Description({ children }: DescriptionProps) {
  return (
    <Container>
      <ImageContainer>
        <Info16Icon />
      </ImageContainer>
      <TextContainer>
        <Typography variant="h6">{children}</Typography>
      </TextContainer>
    </Container>
  );
}
