import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';

import {
  Body,
  ControlInputButtonContainer,
  ControlInputText,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  IconContainer,
  PrivateKeyInputWrapper,
  StyledIconTextButton,
} from './-styled';

import CloseIcon from '@/assets/images/icons/Close24.svg';
import PasteIcon from '@/assets/images/icons/Paste18.svg';

export default function Entry() {
  const { t } = useTranslation();

  const [inputPrivateKey, setInputPrivateKey] = useState('');

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
            {/* TODO 추가 필요 */}
            {/* <MnemonicInputController>
    <IconTextButton>

    </IconTextButton>

  </MnemonicInputController> */}

            <ControlInputButtonContainer>
              {isPrivateKetEntered ? (
                <StyledIconTextButton
                  LeadingIcon={
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
                  LeadingIcon={
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
