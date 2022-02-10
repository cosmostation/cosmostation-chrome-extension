import Header from '~/Popup/components/Header';

import { Body, Container } from './styled';

type BaseLayoutProps = {
  useHeader?: boolean;
  children: JSX.Element;
};

export default function BaseLayout({ useHeader = true, children }: BaseLayoutProps) {
  const containerHeight = `${60 - (useHeader ? 5.2 : 0)}rem`;

  return (
    <Body>
      {useHeader && <Header />}
      <Container data-height={containerHeight}>{children}</Container>
    </Body>
  );
}
