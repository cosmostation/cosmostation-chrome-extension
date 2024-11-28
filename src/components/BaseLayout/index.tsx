import { Body, BodyContentsContainer, Container, Footer } from './styled';

type BaseLayoutProps = {
  header?: JSX.Element;
  footer?: JSX.Element;
  children?: JSX.Element;
};
// TODO Footer제거
export default function BaseLayout({ header, footer, children }: BaseLayoutProps) {
  return (
    <Container>
      {header}
      <Body>
        <>
          <BodyContentsContainer>{children}</BodyContentsContainer>
          {footer && <Footer>{footer}</Footer>}
        </>
      </Body>
    </Container>
  );
}
