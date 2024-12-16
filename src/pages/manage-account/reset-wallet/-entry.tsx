import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import { Route as Initial } from '@/pages/account/initial';
import { toastSuccess } from '@/utils/toast';
import { useExtensionSessionStorageStore } from '@/zustand/hooks/useExtensionSessionStorageStore';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import ResetBottomSheet from './-components/ResetBottomSheet';
import {
  Body,
  CheckBoxContainer,
  CheckBoxTextContainer,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  StyledCheckBoxContainer,
} from './-styled';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { resetExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { resetExtensionSessionStorageStore } = useExtensionSessionStorageStore((state) => state);

  const [isCheckTerms, setIsCheckTerms] = useState([false, false, false]);

  const [isOpenResetBottomSheet, setIsOpenResetBottomSheet] = useState(false);

  const isButtonEnabled = isCheckTerms.every((isCheck) => isCheck);

  const handleCheck = (index: number) => {
    setIsCheckTerms((prev) => {
      const newCheckTerms = [...prev];
      newCheckTerms[index] = !newCheckTerms[index];
      return newCheckTerms;
    });
  };

  const reset = () => {
    resetExtensionStorageStore();
    resetExtensionSessionStorageStore();
    toastSuccess(t('pages.manage-account.reset-wallet.entry.resetSuccess'));

    navigate({
      to: Initial.to,
    });
  };

  return (
    <>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.manage-account.reset-wallet.entry.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.manage-account.reset-wallet.entry.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>
          <CheckBoxContainer>
            <StyledCheckBoxContainer
              onClick={() => {
                handleCheck(0);
              }}
            >
              <CheckBoxTextContainer>
                <Base1300Text variant="b3_R_Multiline">{t('pages.manage-account.reset-wallet.entry.description1')}</Base1300Text>
              </CheckBoxTextContainer>
            </StyledCheckBoxContainer>
            <StyledCheckBoxContainer
              onClick={() => {
                handleCheck(1);
              }}
            >
              <CheckBoxTextContainer>
                <Base1300Text variant="b3_R">{t('pages.manage-account.reset-wallet.entry.description2')}</Base1300Text>
              </CheckBoxTextContainer>
            </StyledCheckBoxContainer>
            <StyledCheckBoxContainer
              onClick={() => {
                handleCheck(2);
              }}
            >
              <CheckBoxTextContainer>
                <Base1300Text variant="b3_R">{t('pages.manage-account.reset-wallet.entry.description3')}</Base1300Text>
              </CheckBoxTextContainer>
            </StyledCheckBoxContainer>
          </CheckBoxContainer>
        </Body>
      </BaseBody>
      <BaseFooter>
        <Button
          onClick={() => {
            setIsOpenResetBottomSheet(true);
          }}
          disabled={!isButtonEnabled}
        >
          {t('pages.manage-account.reset-wallet.entry.resetWallet')}
        </Button>
      </BaseFooter>
      <ResetBottomSheet
        open={isOpenResetBottomSheet}
        onClose={() => setIsOpenResetBottomSheet(false)}
        onClickReset={() => {
          reset();
        }}
      />
    </>
  );
}
