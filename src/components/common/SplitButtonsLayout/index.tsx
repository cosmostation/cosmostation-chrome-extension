import { CancelButtonContainer, ConfirmButtonContainer, Container } from './styled';

type SplitButtonsLayoutProps = {
  cancelButton: React.ReactNode;
  confirmButton: React.ReactNode;
};

export default function SplitButtonsLayout({ cancelButton, confirmButton }: SplitButtonsLayoutProps) {
  return (
    <Container>
      <CancelButtonContainer>{cancelButton}</CancelButtonContainer>
      <ConfirmButtonContainer>{confirmButton}</ConfirmButtonContainer>
    </Container>
  );
}
