import { Body, Container, Header } from './styled';

type BaseLayoutProps = {
  header?: JSX.Element;
  children?: JSX.Element;
};
export default function BaseLayout({ header, children }: BaseLayoutProps) {
  return (
    <Container>
      <Header>{header}</Header>
      <Body>
        <>{children}</>
      </Body>
    </Container>
  );
}
