import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';
import IconTextButton from '@/components/common/IconTextButton';
import { Route as ManageAssets } from '@/pages/manage-assets/visibility/assets';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Container, MarginLeftTypography } from './styled';

import PlusIcon from '@/assets/images/icons/Plus12.svg';

function ManageCryptoSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isHideSmalValue = useExtensionStorageStore((state) => state.isHideSmalValue);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);

  const handleToggleHideSmallValue = useCallback(() => {
    updateExtensionStorageStore('isHideSmalValue', !isHideSmalValue);
  }, [isHideSmalValue, updateExtensionStorageStore]);

  const handleNavigateToManageAssets = useCallback(() => {
    navigate({
      to: ManageAssets.to,
    });
  }, [navigate]);

  return (
    <Container>
      <CheckBoxTextButton isChecked={isHideSmalValue} onClick={handleToggleHideSmallValue}>
        <Typography variant="b3_R">{t('pages.index.hideSmallBalance')}</Typography>
      </CheckBoxTextButton>
      <IconTextButton onClick={handleNavigateToManageAssets} leadingIcon={<PlusIcon />}>
        <MarginLeftTypography variant="b3_M">{t('pages.index.manageCrypto')}</MarginLeftTypography>
      </IconTextButton>
    </Container>
  );
}

export default memo(ManageCryptoSection);
