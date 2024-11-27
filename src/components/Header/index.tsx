import { Container, LeftContentContainer, MiddleContentContainer, RightContentContainer } from './styled';

type HeaderProps = {
  leftContent?: JSX.Element;
  middleContent?: JSX.Element;
  rightContent?: JSX.Element;
};

export default function Header({ leftContent, middleContent, rightContent }: HeaderProps) {
  return (
    <Container>
      <LeftContentContainer>{leftContent && leftContent}</LeftContentContainer>
      <MiddleContentContainer>{middleContent && middleContent}</MiddleContentContainer>
      <RightContentContainer>{rightContent && rightContent}</RightContentContainer>
    </Container>
  );
}
