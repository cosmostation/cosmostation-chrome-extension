import { Typography } from '@mui/material';

import { BackButton, Container, TextContainer } from './styled';

import BackIcon from '~/images/icons/Back.svg';

type SubHeaderProps = {
  title: string;
  onClick?: () => void;
};

export default function SubHeader({ title, onClick }: SubHeaderProps) {
  return (
    <Container>
      <BackButton onClick={onClick}>
        <BackIcon />
      </BackButton>
      <TextContainer>
        <Typography variant="h3">{title}</Typography>
      </TextContainer>
    </Container>
  );
}
