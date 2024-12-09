import { useTranslation } from 'react-i18next';

import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';

import { SaveButton } from './-styled';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();

  return (
    <BaseLayout
      header={
        <Header
          leftContent={<NavigationPanel />}
          middleContent={<Base1300Text variant="h4_B">{t('pages.manage-account.mange-wallet-and-account.layout.header')}</Base1300Text>}
          rightContent={<SaveButton typoVarient="h6n_M">{t('pages.manage-account.mange-wallet-and-account.layout.save')}</SaveButton>}
        />
      }
    >
      {children}
    </BaseLayout>
  );
}
