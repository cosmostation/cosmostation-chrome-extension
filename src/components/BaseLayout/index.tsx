import { Body, Container } from './styled';

type BaseLayoutProps = {
  header?: JSX.Element;
  children?: JSX.Element;
};
export default function BaseLayout({ header, children }: BaseLayoutProps) {
  return (
    <Container>
      {header}
      <Body>
        <>{children}</>
      </Body>
    </Container>
  );
}
