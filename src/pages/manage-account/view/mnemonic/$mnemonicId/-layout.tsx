import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

type LayoutProps = {
  mnemonicId: string;
  children: JSX.Element;
};

export default function Layout({ mnemonicId, children }: LayoutProps) {
  const { mnemonicNamesByHashedMnemonic } = useExtensionStorageStore((state) => state);

  const mnemonicName = mnemonicNamesByHashedMnemonic[mnemonicId];

  return (
    <BaseLayout header={<Header leftContent={<NavigationPanel />} middleContent={<Base1300Text variant="h4_B">{mnemonicName}</Base1300Text>} />}>
      {children}
    </BaseLayout>
  );
}
