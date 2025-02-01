import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';

import DisconnectBottomSheet from './-components/DisconnectBottomSheet';
import { FooterContainer } from './-styled';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();

  const [isOpenDisconnectBottomSheet, setIsOpenDisconnectBottomSheet] = useState(false);

  const { currentAccountApporvedOrigins, removeAllApprovedOrigin } = useCurrentAccount();

  const hasApprovedOrigins = currentAccountApporvedOrigins.length > 0;

  return (
    <>
      <BaseLayout
        header={
          <Header leftContent={<NavigationPanel />} middleContent={<Base1300Text variant="h4_B">{t('pages.manage-dapps.layout.header')}</Base1300Text>} />
        }
        footer={
          <FooterContainer>
            <Button
              disabled={!hasApprovedOrigins}
              onClick={async () => {
                setIsOpenDisconnectBottomSheet(true);
              }}
              variant="red"
            >
              {t('pages.manage-dapps.layout.disconnectAll')}
            </Button>
          </FooterContainer>
        }
      >
        {children}
      </BaseLayout>
      <DisconnectBottomSheet
        open={isOpenDisconnectBottomSheet}
        onClose={() => setIsOpenDisconnectBottomSheet(false)}
        onClickConfirm={() => {
          removeAllApprovedOrigin();
          setIsOpenDisconnectBottomSheet(false);
        }}
      />
    </>
  );
}
