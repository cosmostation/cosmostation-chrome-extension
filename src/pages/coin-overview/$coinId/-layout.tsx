import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import FooterCoinPrice from '@/components/FooterCoinPrice';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';

type LayoutProps = {
  children: JSX.Element;
  coinId: string;
};

export default function Layout({ children, coinId }: LayoutProps) {
  const { currentAccount } = useCurrentAccount();

  return (
    <BaseLayout
      header={<Header leftContent={<NavigationPanel />} middleContent={<Base1300Text variant="h4_B">{currentAccount.name}</Base1300Text>} />}
      footer={<FooterCoinPrice coinId={coinId} />}
    >
      {children}
    </BaseLayout>
  );
}
