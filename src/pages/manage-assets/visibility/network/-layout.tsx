import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import IconButton from '@/components/common/IconButton';
import GithubBottomSheet from '@/components/GithubBottomSheet';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';

import { InfoIconContainer } from './-styled';

import InfoIcon from '@/assets/images/icons/Information14.svg';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();

  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);

  return (
    <>
      <BaseLayout
        header={
          <Header
            leftContent={<NavigationPanel />}
            middleContent={<Base1300Text variant="h4_B">{t('pages.manage-assets.visibility.network.layout.header')}</Base1300Text>}
            rightContent={
              <IconButton onClick={() => setIsOpenBottomSheet(true)}>
                <InfoIconContainer>
                  <InfoIcon />
                </InfoIconContainer>
              </IconButton>
            }
          />
        }
      >
        {children}
      </BaseLayout>
      <GithubBottomSheet
        open={isOpenBottomSheet}
        headerTitle={t('pages.manage-assets.visibilitynetwork.network.layout.headerTitle')}
        contentsSubTitle={t('pages.manage-assets.visibilitynetwork.network.layout.contentsSubTitle')}
        onClose={() => setIsOpenBottomSheet(false)}
        onClickConfirm={() => {
          window.open('https://github.com/cosmostation/chainlist', '_blank');
        }}
      />
    </>
  );
}
