import type { ToastContentProps } from 'react-toastify';

import { Container, IconContainer, StyledIconButton, TitleContainer, TitleText } from './styled';

import CautionIcon from '@/assets/images/icons/Caution16.svg';
import CloseIcon from '@/assets/images/icons/Close24.svg';
import ConfirmIcon from '@/assets/images/icons/Confirm20.svg';

type ToastProps = {
  title: string;
  toastContentProps: ToastContentProps;
};

export default function Toast({ title, toastContentProps }: ToastProps) {
  const { toastProps, closeToast } = toastContentProps;
  const { type } = toastProps;

  const icon = (() => {
    if (type === 'success') return <CautionIcon />;

    if (type === 'error') return <CautionIcon />;

    return <ConfirmIcon />;
  })();

  return (
    <Container>
      <TitleContainer>
        <IconContainer data-type={type}>{icon}</IconContainer>
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
