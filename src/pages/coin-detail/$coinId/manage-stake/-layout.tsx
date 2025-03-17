import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import IconButton from '@/components/common/IconButton';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';

import SuiStakingInfoBottomSheet from './-components/SuiStakingInfoBottomSheet';
import { InfoIconContainer } from './-styled';

import InfoIcon from '@/assets/images/icons/Information14.svg';

type LayoutProps = {
  coinId: string;
  children: JSX.Element;
};

export default function Layout({ coinId, children }: LayoutProps) {
  const { t } = useTranslation();
  const { getAccountAsset } = useGetAccountAsset({ coinId });

  const accountAsset = getAccountAsset();

  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);

  return (
    <>
      <BaseLayout
        header={
          <Header
            leftContent={<NavigationPanel />}
            middleContent={<Base1300Text variant="h4_B">{t('pages.coin-detail.$coinId.manage-stake.layout.header')}</Base1300Text>}
            rightContent={
              accountAsset?.chain.chainType === 'sui' ? (
                <IconButton onClick={() => setIsOpenBottomSheet(true)}>
                  <InfoIconContainer>
                    <InfoIcon />
                  </InfoIconContainer>
                </IconButton>
              ) : undefined
            }
          />
        }
      >
        {children}
      </BaseLayout>
      <SuiStakingInfoBottomSheet open={isOpenBottomSheet} onClose={() => setIsOpenBottomSheet(false)} coinId={coinId} />
    </>
  );
}
