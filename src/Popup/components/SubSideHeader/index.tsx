import { Typography } from '@mui/material';

import { BackButton, Container, TextContainer } from './styled';

import LeftArrow16Icon from '~/images/icons/LeftArrow16.svg';

type SubSideHeaderProps = {
  title?: string;
  onClick?: () => void;
  children: JSX.Element;
};

export default function SubSideHeader({ title, children, onClick }: SubSideHeaderProps) {
  return (
    <Container>
      <BackButton onClick={onClick}>
        <LeftArrow16Icon />
      </BackButton>
      <TextContainer>
        <Typography variant="h3">{title}</Typography>
      </TextContainer>
      {children}
    </Container>
  );
}
