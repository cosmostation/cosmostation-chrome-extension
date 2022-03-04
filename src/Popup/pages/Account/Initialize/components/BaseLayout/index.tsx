import { Body, Container } from './styled';
import Header from '../Header';

type BaseLayoutProps = {
  children: JSX.Element;
  useHeader?: React.ComponentProps<typeof Header>;
};

export default function BaseLayout({ children, useHeader }: BaseLayoutProps) {
  const containerHeight = `${60 - (useHeader ? 7.6 : 0)}rem`;
  return (
    <Body>
      {useHeader && <Header {...useHeader} />}
      <Container data-height={containerHeight}>{children}</Container>
    </Body>
  );
}
