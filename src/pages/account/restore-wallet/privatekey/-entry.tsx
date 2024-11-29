import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import IconTextButton from '@/components/common/IconTextButton';
import OutlinedInput from '@/components/common/OutlinedInput';

import {
  Body,
  ControlInputButtonContainer,
  ControlInputText,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  IconContainer,
  MarginRightTypography,
  PrivateKeyInputWrapper,
  StyledIconTextButton,
  TopContainer,
  ViewIconContainer,
} from './-styled';

import CloseIcon from '@/assets/images/icons/Close24.svg';
import PasteIcon from '@/assets/images/icons/Paste18.svg';
import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

export default function Entry() {
  const { t } = useTranslation();

  const [inputPrivateKey, setInputPrivateKey] = useState('');
  const [isViewPrivateKey, setIsViewPrivateKey] = useState(false);

  const isPrivateKetEntered = !!inputPrivateKey;

  const pasteFromClipboard = async () => {
    const clipboard = await navigator.clipboard.readText();

    console.log('🚀 ~ pasteFromClipboard ~ clipboard:', clipboard);

    // handleChange(0, clipboard);
  };

  const clearAll = () => {
    setInputPrivateKey('');
  };

  return (
    <>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.account.restore-wallet.privatekey.index.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R">{t('pages.account.restore-wallet.privatekey.index.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>
          <PrivateKeyInputWrapper>
            <TopContainer>
              <IconTextButton
                trailingIcon={<ViewIconContainer>{isViewPrivateKey ? <ViewHideIcon /> : <ViewIcon />}</ViewIconContainer>}
                onClick={() => {
                  setIsViewPrivateKey(!isViewPrivateKey);
                }}
              >
                <MarginRightTypography variant="b2_M">{t('pages.account.restore-wallet.privatekey.index.privateKey')}</MarginRightTypography>
              </IconTextButton>
            </TopContainer>

            <OutlinedInput
              placeholder={t('pages.account.restore-wallet.privatekey.index.enterPrivateKey')}
              multiline
              rows={5}
              type={isViewPrivateKey ? 'text' : 'password'}
              // value={search}
              // onChange={(event) => {
              //   setSearch(event.currentTarget.value);
              // }}
            />

            <ControlInputButtonContainer>
              {isPrivateKetEntered ? (
                <StyledIconTextButton
                  leadingIcon={
                    <IconContainer>
                      <CloseIcon />
                    </IconContainer>
                  }
                  onClick={clearAll}
                >
                  <ControlInputText variant="b3_R">{t('pages.account.restore-wallet.privatekey.index.clearAll')}</ControlInputText>
                </StyledIconTextButton>
              ) : (
                <StyledIconTextButton
                  leadingIcon={
                    <IconContainer>
                      <PasteIcon />
                    </IconContainer>
                  }
                  onClick={pasteFromClipboard}
                >
                  <ControlInputText variant="b3_R">{t('pages.account.restore-wallet.privatekey.index.pasteFromClipboard')}</ControlInputText>
                </StyledIconTextButton>
              )}
            </ControlInputButtonContainer>
          </PrivateKeyInputWrapper>
        </Body>
      </BaseBody>
      <BaseFooter>
        <Button>{t('pages.account.restore-wallet.privatekey.index.next')}</Button>
      </BaseFooter>
    </>
  );
}
