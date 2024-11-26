import { BodyContainer, BottomContainer, Container, ContentsContainer, TopContainer } from './styled';

type MainBoxProps = {
  top: JSX.Element;
  body: JSX.Element;
  bottom?: JSX.Element;
  className?: string;
  backgroundImage?: string;
};

export default function MainBox({ top, body, bottom, className, backgroundImage }: MainBoxProps) {
  return (
    <Container className={className} backgroundImage={backgroundImage}>
      <ContentsContainer data-is-bottom={!!bottom}>
        <TopContainer>{top}</TopContainer>
        <BodyContainer>{body}</BodyContainer>
      </ContentsContainer>
      {bottom && <BottomContainer>{bottom}</BottomContainer>}
    </Container>
  );
}
