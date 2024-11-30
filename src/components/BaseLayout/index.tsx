import { Body, Container, Footer, Header } from './styled';

type BaseLayoutProps = {
  header?: JSX.Element;
  footer?: JSX.Element;
  children?: JSX.Element;
};
export default function BaseLayout({ header, footer, children }: BaseLayoutProps) {
  return (
    <Container>
      {header && <Header>{header}</Header>}
      <Body>{children}</Body>
      {footer && <Footer>{footer}</Footer>}
    </Container>
  );
}
