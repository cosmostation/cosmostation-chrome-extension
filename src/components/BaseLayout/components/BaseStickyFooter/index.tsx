import { Container, LeftContentContainer, RightContentContainer } from './styled';

type StickyFooterProps = {
  leftContent?: JSX.Element;
  rightContent?: JSX.Element;
};

export default function StickyFooter({ leftContent, rightContent }: StickyFooterProps) {
  return (
    <Container>
      <LeftContentContainer>{leftContent && leftContent}</LeftContentContainer>
      <RightContentContainer>{rightContent && rightContent}</RightContentContainer>
    </Container>
  );
}
