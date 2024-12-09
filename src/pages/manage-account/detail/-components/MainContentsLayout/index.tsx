import { BodyContainer, Container, TopContainer } from './styled';

type MainContentsLayoutProps = {
  top: JSX.Element;
  body: JSX.Element;
};

export default function MainContentsLayout({ top, body }: MainContentsLayoutProps) {
  return (
    <Container>
      <TopContainer>{top}</TopContainer>
      <BodyContainer>{body}</BodyContainer>
    </Container>
  );
}
