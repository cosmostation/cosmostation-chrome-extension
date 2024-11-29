import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as bip39 from 'bip39';
import { InputAdornment } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import TextButton from '@/components/common/TextButton';

import HdPathBottomSheet from './-components/HdPathBottomSheet';
import {
  Body,
  ControlInputButtonContainer,
  ControlInputText,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  HdPathContainer,
  HdPathDescription,
  IconContainer,
  MnemonicInputContainer,
  MnemonicInputWrapper,
  MnemonicWordIndexText,
  StyledIconTextButton,
  StyledInput,
} from './-styled';

import CloseIcon from '@/assets/images/icons/Close24.svg';
import PasteIcon from '@/assets/images/icons/Paste18.svg';

export default function Entry() {
  const { t } = useTranslation();

  const [isOpenHdPathBottomSheet, setIsOpenHdPathBottomSheet] = useState(false);
  const [currentHdPathIndex, setcurrentHdPathIndex] = useState('0');

  const [values, setValues] = useState<string[]>(Array(12).fill(''));

  // FIXME 첫번쨰 입력이 아닌 두번쨰칸에 입력됐을때 2번째 부터 입력이 되는 현상 발견.
  const handleChange = (index: number, value: string) => {
    let newValues = [...values];
    const words = value.split(' ');

    if (words.length === 24) {
      setValues(Array(24).fill(''));
      newValues = Array(24).fill('');
    }

    if (words.length > 1) {
      words.forEach((word, i) => {
        if (index + i < newValues.length) {
          newValues[index + i] = word;
        }
      });
    } else {
      newValues[index] = value;
    }

    setValues(newValues);
  };

  const isValid = bip39.validateMnemonic('start');

  const isMnemonicExists = values.some((value) => !!value);

  console.log('🚀 ~ Entry ~ isValid:', isValid);

  // encryptedMnemonic: aesEncrypt(data.mnemonic, currentPassword!),

  // const set24Words = () => {
  //   const newValues = [...values.slice(0, 12), ...Array(12).fill('')];

  //   setValues(newValues);
  // };

  // const set12Words = () => {
  //   setValues(values.slice(0, 12));
  // };

  // NOTE 니모닉 입력창 선택 로직
  // () => {
  //   if (values.length === 12) {
  //     set24Words();
  //   } else {
  //     set12Words();
  //   }
  // }

  const pasteFromClipboard = async () => {
    const clipboard = await navigator.clipboard.readText();

    handleChange(0, clipboard);
  };

  const clearAll = () => {
    if (values.length === 12) {
      setValues(Array(12).fill(''));
    } else {
      setValues(Array(24).fill(''));
    }
  };

  return (
    <>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.account.restore-wallet.mnemonic.index.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R">{t('pages.account.restore-wallet.mnemonic.index.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>

          <MnemonicInputWrapper>
            {/* TODO 추가 필요 */}
            {/* <MnemonicInputController>
    <IconTextButton>

    </IconTextButton>

  </MnemonicInputController> */}
            <MnemonicInputContainer>
              {values.map((value, index) => (
                <StyledInput
                  key={index}
                  value={value}
                  startAdornment={
                    <InputAdornment position="start">
                      <MnemonicWordIndexText variant="h5n_M">{index}</MnemonicWordIndexText>
                    </InputAdornment>
                  }
                  onChange={(e) => {
                    if (e.target.value.endsWith(' ')) {
                      return;
                    }

                    handleChange(index, e.target.value);
                  }}
                />
              ))}
            </MnemonicInputContainer>
            <ControlInputButtonContainer>
              {isMnemonicExists ? (
                <StyledIconTextButton
                  LeadingIcon={
                    <IconContainer>
                      <CloseIcon />
                    </IconContainer>
                  }
                  onClick={clearAll}
                >
                  <ControlInputText variant="b3_R">{t('pages.account.restore-wallet.mnemonic.index.clearAll')}</ControlInputText>
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
                  <ControlInputText variant="b3_R">{t('pages.account.restore-wallet.mnemonic.index.pasteFromClipboard')}</ControlInputText>
                </StyledIconTextButton>
              )}
            </ControlInputButtonContainer>
          </MnemonicInputWrapper>
        </Body>
      </BaseBody>
      <BaseFooter>
        <>
          <HdPathContainer>
            <HdPathDescription variant="b3_R">{t('pages.account.restore-wallet.mnemonic.index.hdPathDescription')}</HdPathDescription>
            <TextButton
              onClick={() => {
                setIsOpenHdPathBottomSheet(true);
              }}
              variant="hyperlink"
              typoVarient="b2_M"
            >
              {t('pages.account.restore-wallet.mnemonic.index.hdPathSetting')}
            </TextButton>
          </HdPathContainer>
          <Button>{t('pages.account.restore-wallet.mnemonic.index.next')}</Button>
        </>
      </BaseFooter>
      <HdPathBottomSheet
        currentHdPath={currentHdPathIndex}
        open={isOpenHdPathBottomSheet}
        onClose={() => setIsOpenHdPathBottomSheet(false)}
        onChangeHpPath={(val) => setcurrentHdPathIndex(val)}
      />
    </>
  );
}
