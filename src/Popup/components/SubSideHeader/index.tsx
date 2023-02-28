import { Typography } from '@mui/material';

import { useNavigate } from '~/Popup/hooks/useNavigate';

import { BackButton, Container, TextContainer } from './styled';

import LeftArrow16Icon from '~/images/icons/LeftArrow16.svg';

type SubSideHeaderProps = {
  title?: string;
  children: JSX.Element;
};

export default function SubSideHeader({ title, children }: SubSideHeaderProps) {
  const { navigateBack } = useNavigate();

  return (
    <Container>
      <BackButton onClick={() => navigateBack()}>
        <LeftArrow16Icon />
      </BackButton>
      <TextContainer>
        <Typography variant="h3">{title}</Typography>
      </TextContainer>
      {children}
    </Container>
  );
}
