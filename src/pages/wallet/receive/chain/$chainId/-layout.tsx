import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { currentAccount } = useCurrentAccount();

  return (
    <BaseLayout header={<Header leftContent={<NavigationPanel />} middleContent={<Base1300Text variant="h4_B">{currentAccount.name}</Base1300Text>} />}>
      {children}
    </BaseLayout>
  );
}
