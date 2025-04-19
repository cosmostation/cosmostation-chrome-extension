import { Container, LeftContentContainer, RightContentContainer, StyledButton } from './styled';

type StickyFooterProps = {
  leftContent?: JSX.Element;
  rightContent?: JSX.Element;
  onClick?: () => void;
};

export default function StickyFooter({ leftContent, rightContent, onClick }: StickyFooterProps) {
  const Wrapper = onClick ? StyledButton : Container;

  return (
    <Wrapper {...(onClick ? { onClick } : {})}>
      <LeftContentContainer>{leftContent}</LeftContentContainer>
      <RightContentContainer>{rightContent}</RightContentContainer>
    </Wrapper>
  );
}
