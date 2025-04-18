import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import IconButton from '@/components/common/IconButton';
import Header from '@/components/Header';
import ResetBottomSheet from '@/pages/manage-account/reset-wallet/-components/ResetBottomSheet';

import {
  Body,
  CheckBoxContainer,
  CheckBoxTextContainer,
  ContentsContainer,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  HeaderContainer,
  HeaderLeftContainer,
  IconContainer,
  Overlay,
  StyledCheckBoxContainer,
} from './styled';

import ArrowBackIcon from '@/assets/images/icons/LeftArrow16.svg';

type ResetOverlayProps = {
  open?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ResetOverlay({ open = false, onClose, onConfirm }: ResetOverlayProps) {
  const { t } = useTranslation();

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
    onClose();
    setIsCheckTerms([false, false, false]);
  };

  const onHandleConfirm = () => {
    onConfirm();
    reset();
  };

  if (!open) {
    return null;
  }

  return (
    <Overlay>
      <HeaderContainer>
        <Header
          leftContent={
            <HeaderLeftContainer>
              <IconButton onClick={reset}>
                <IconContainer>
                  <ArrowBackIcon />
                </IconContainer>
              </IconButton>
            </HeaderLeftContainer>
          }
          middleContent={<Base1300Text variant="h4_B">{t('pages.manage-account.reset-wallet.layout.header')}</Base1300Text>}
        />
      </HeaderContainer>
      <ContentsContainer>
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
          <ResetBottomSheet open={isOpenResetBottomSheet} onClose={() => setIsOpenResetBottomSheet(false)} onClickReset={onHandleConfirm} />
        </>
      </ContentsContainer>
    </Overlay>
  );
}
