import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import Header from '@/components/Header';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { currentAccount } = useCurrentAccount();
  const { accountNamesById } = useExtensionStorageStore((state) => state);

  const accountName = accountNamesById[currentAccount.id];

  return <BaseLayout header={<Header middleContent={<Base1300Text variant="h4_B">{accountName}</Base1300Text>} />}>{children}</BaseLayout>;
}
