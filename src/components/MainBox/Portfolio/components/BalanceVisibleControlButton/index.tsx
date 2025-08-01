import { useTranslation } from 'react-i18next';

import IconTextButton from '@/components/common/IconTextButton';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { ViewIconContainer, ViewTotalValueText } from '../../styled';

import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

export default function BalanceVisibleControlButton() {
  const { t } = useTranslation();
  const isBalanceVisible = useExtensionStorageStore((state) => state.isBalanceVisible);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);

  return (
    <IconTextButton
      onClick={() => {
        updateExtensionStorageStore('isBalanceVisible', !isBalanceVisible);
      }}
      trailingIcon={<ViewIconContainer>{isBalanceVisible ? <ViewIcon /> : <ViewHideIcon />}</ViewIconContainer>}
    >
      <ViewTotalValueText variant="b3_M">{t('components.MainBox.Portfolio.index.totalValue')}</ViewTotalValueText>
    </IconTextButton>
  );
}
