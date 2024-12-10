import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { mnemonicNamesByHashedMnemonic } = useExtensionStorageStore((state) => state);

  const mnemonicName =
    mnemonicNamesByHashedMnemonic[
      'c37b134dcf0daa6fb42b82261b56d835fee00ebc369c63860046b9e84d9c57928a5a366d6619e1a4faa14c414c119b659fe9acd04ad9d898228e5bf22e5440db'
    ];

  return (
    <BaseLayout header={<Header leftContent={<NavigationPanel />} middleContent={<Base1300Text variant="h4_B">{mnemonicName}</Base1300Text>} />}>
      {children}
    </BaseLayout>
  );
}
