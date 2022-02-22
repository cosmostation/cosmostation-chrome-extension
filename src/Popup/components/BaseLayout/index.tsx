import Header from '~/Popup/components/Header';
import SubHeader from '~/Popup/components/SubHeader';

import { Body, Container } from './styled';

type BaseLayoutProps = {
  useHeader?: React.ComponentProps<typeof Header>;
  useSubHeader?: {
    title: string;
    onClick?: () => void;
  };
  children: JSX.Element;
};

export default function BaseLayout({ useHeader, useSubHeader, children }: BaseLayoutProps) {
  const containerHeight = `${60 - (useHeader ? 5.2 : 0) - (useSubHeader ? 4.4 : 0)}rem`;

  return (
    <Body>
      {useHeader && <Header {...useHeader} />}
      {useSubHeader && <SubHeader {...useSubHeader} />}
      <Container data-height={containerHeight}>{children}</Container>
    </Body>
  );
}
