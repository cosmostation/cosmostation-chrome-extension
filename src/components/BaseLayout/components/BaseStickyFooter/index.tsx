import { Container, LeftContentContainer, RightContentContainer } from './styled';

type StickyFooterProps = {
  leftContent?: JSX.Element;
  rightContent?: JSX.Element;
  onClick?: () => void;
};

export default function StickyFooter({ leftContent, rightContent, onClick }: StickyFooterProps) {
  return (
    <Container onClick={onClick}>
      <LeftContentContainer>{leftContent}</LeftContentContainer>
      <RightContentContainer>{rightContent}</RightContentContainer>
    </Container>
  );
}
