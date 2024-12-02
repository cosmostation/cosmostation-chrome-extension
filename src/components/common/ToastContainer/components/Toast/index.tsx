import type { ToastContentProps } from 'react-toastify';

import { Container, IconContainer, StyledIconButton, TitleContainer, TitleText } from './styled';

import CautionIcon from '@/assets/images/icons/Caution16.svg';
import CloseIcon from '@/assets/images/icons/Close24.svg';

type ToastProps = {
  title: string;
  toastContentProps: ToastContentProps;
};

export default function Toast({ title, toastContentProps }: ToastProps) {
  const { toastProps, closeToast } = toastContentProps;
  const { type } = toastProps;

  const icon = (() => {
    if (type === 'error') return <CautionIcon />;

    return <CautionIcon />;
  })();

  return (
    <Container>
      <TitleContainer>
        <IconContainer>{icon}</IconContainer>
        <TitleText variant="b2_B">{title}</TitleText>
      </TitleContainer>
      <StyledIconButton
        onClick={() => {
          closeToast();
        }}
      >
        <CloseIcon />
      </StyledIconButton>
    </Container>
  );
}
