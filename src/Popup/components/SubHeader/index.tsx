import { Typography } from '@mui/material';

import { BackButton, Container, TextContainer } from './styled';

import LeftArrow16Icon from '~/images/icons/LeftArrow16.svg';

type SubHeaderProps = {
  title: string;
  onClick?: () => void;
};

export default function SubHeader({ title, onClick }: SubHeaderProps) {
  return (
    <Container>
      <BackButton onClick={onClick}>
        <LeftArrow16Icon />
      </BackButton>
      <TextContainer>
        <Typography variant="h3">{title}</Typography>
      </TextContainer>
    </Container>
  );
}
