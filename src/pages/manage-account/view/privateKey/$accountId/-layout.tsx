import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

type LayoutProps = {
  accountId: string;
  children: JSX.Element;
};

export default function Layout({ accountId, children }: LayoutProps) {
  const { accountNamesById } = useExtensionStorageStore((state) => state);

  const accountName = accountNamesById[accountId];

  return (
    <BaseLayout header={<Header leftContent={<NavigationPanel />} middleContent={<Base1300Text variant="h4_B">{accountName}</Base1300Text>} />}>
      {children}
    </BaseLayout>
  );
}
