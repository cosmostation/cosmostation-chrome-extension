import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as bip39 from 'bip39';
import { v4 as uuidv4 } from 'uuid';
import { InputAdornment } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import IconTextButton from '@/components/common/IconTextButton';
import TextButton from '@/components/common/TextButton';
import MnemonicBitsPopover from '@/components/MnemonicViewer/components/MnemonicBitsPopover';
import SetAccountNameBottomSheet from '@/components/SetNameBottomSheet';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { getPassword } from '@/libs/account';
import { sendMessage } from '@/libs/extension';
import { Route as Dashboard } from '@/pages/index';
import type { AccountWithName } from '@/types/account';
import { aesEncrypt } from '@/utils/crypto';
import { sha512 } from '@/utils/crypto/password';
import { toastError } from '@/utils/toast';
import { addPreferAccountType } from '@/utils/zustand/preferAccountType';
import { loadExtensionStorageStoreFromStorage, useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useLoadingOverlayStore } from '@/zustand/hooks/useLoadingOverlayStore';

import HdPathBottomSheet from './-components/HdPathBottomSheet';
import {
  Body,
  BottomChevronIconContainer,
  ControlInputButtonContainer,
  ControlInputText,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  HdPathContainer,
  HdPathDescription,
  IconContainer,
  MarginRightTypography,
  MnemonicInputContainer,
  MnemonicInputWrapper,
  MnemonicWordIndexText,
  StyledIconTextButton,
  StyledInput,
  TopContainer,
  ViewIconContainer,
} from './-styled';
import type { MnemonicBits } from '../../create-wallet/mnemonic/-entry';

import BottomChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';
import CloseIcon from '@/assets/images/icons/Close24.svg';
import PasteIcon from '@/assets/images/icons/Paste18.svg';
import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { updateLoadingOverlay } = useLoadingOverlayStore((state) => state);

  const { currentPassword } = useCurrentPassword();
  const { mnemonicNamesByHashedMnemonic, comparisonPasswordHash, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { addAccountWithName, setCurrentAccount } = useCurrentAccount();

  const { refetch: refetchAccountAssets } = useAccountAssets();

  const [isViewMnemonic, setIsViewMnemonic] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);

  const [isOpenHdPathBottomSheet, setIsOpenHdPathBottomSheet] = useState(false);
  const [currentHdPathIndex, setCurrentHdPathIndex] = useState('0');

  const [values, setValues] = useState<string[]>(Array(12).fill(''));

  const isAnyMnemonicPresent = values.some((value) => !!value);
  const isFormComplete = values.every((value) => !!value);

  const mnemonicWordList = bip39.wordlists.english;

  const [inputTypes, setInputTypes] = useState(values.map(() => (isViewMnemonic ? 'text' : 'password')));

  const handleFocusMnemonicInput = (index: number) => {
    setInputTypes((prevTypes) => {
      const newTypes = [...prevTypes];
      newTypes[index] = 'text';
      return newTypes;
    });
  };

  const handleBlurMnemonicInput = (index: number) => {
    setInputTypes((prevTypes) => {
      const newTypes = [...prevTypes];
      newTypes[index] = isViewMnemonic ? 'text' : 'password';
      return newTypes;
    });
  };

  const updateMnemonicWords = (index: number, value: string) => {
    let newValues = [...values];
    const words = value.split(' ');

    if (words.length === 24) {
      setValues(Array(24).fill(''));
      newValues = Array(24).fill('');
    }

    if (words.length > 1) {
      words.forEach((word, i) => {
        if (i < newValues.length) {
          newValues[i] = word;
        }
      });
    } else {
      newValues[index] = value;
    }

    setValues(newValues);
  };

  const set24Words = () => {
    const newValues = [...values.slice(0, 12), ...Array(12).fill('')];

    setValues(newValues);
  };

  const set12Words = () => {
    setValues(values.slice(0, 12));
  };

  const handleMnemonicBitChange = (bits: MnemonicBits) => {
    if (bits === 128) {
      set12Words();
    } else {
      set24Words();
    }
  };

  const pasteFromClipboard = async () => {
    const clipboard = await navigator.clipboard.readText();

    updateMnemonicWords(0, clipboard);
  };

  const clearAll = () => {
    if (values.length === 12) {
      setValues(Array(12).fill(''));
    } else {
      setValues(Array(24).fill(''));
    }
  };

  useEffect(() => {
    setInputTypes(values.map(() => (isViewMnemonic ? 'text' : 'password')));
  }, [values, isViewMnemonic]);

  const setUpAccount = async (newAccountName: string) => {
    try {
      setIsLoadingBalance(true);

      const joinedMnemonicPhrase = values.join(' ');

      const accountId = uuidv4();

      const decryptedPassword = await getPassword();

      const encryptedMnemonic = aesEncrypt(joinedMnemonicPhrase, decryptedPassword);
      const encryptedRestoreString = sha512(joinedMnemonicPhrase);

      const newAccount: AccountWithName = {
        id: accountId,
        type: 'MNEMONIC',
        name: newAccountName,
        index: currentHdPathIndex,
        encryptedMnemonic: encryptedMnemonic,
        encryptedRestoreString,
      };

      if (!comparisonPasswordHash) {
        const comparisonPasswordHash = sha512(currentPassword!);
        await updateExtensionStorageStore('comparisonPasswordHash', comparisonPasswordHash);
      }

      await addAccountWithName(newAccount);

      const isMnemonicAlreadyRegistered = mnemonicNamesByHashedMnemonic[encryptedRestoreString];

      await addPreferAccountType(newAccount.id);
      await setCurrentAccount(newAccount.id);

      navigate({
        to: Dashboard.to,
      });

      updateLoadingOverlay(true);

      if (!isMnemonicAlreadyRegistered) {
        await updateExtensionStorageStore('mnemonicNamesByHashedMnemonic', {
          ...mnemonicNamesByHashedMnemonic,
          [encryptedRestoreString]: `Mnemonic ${Object.keys(mnemonicNamesByHashedMnemonic).length + 1}`,
        });
      }

      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [newAccount.id] });
      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateDefaultBalance', params: [newAccount.id] });

      // TODO
      // await setExtensionStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);
      await loadExtensionStorageStoreFromStorage();

      await refetchAccountAssets();
    } catch {
      toastError(t('pages.account.restore-wallet.mnemonic.index.addressAndBalanceFetchingError'));
    } finally {
      setIsLoadingBalance(false);
      updateLoadingOverlay(false);
    }
  };

  return (
    <>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.account.restore-wallet.mnemonic.index.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.account.restore-wallet.mnemonic.index.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>

          <MnemonicInputWrapper>
            <TopContainer>
              <IconTextButton
                trailingIcon={<ViewIconContainer>{isViewMnemonic ? <ViewHideIcon /> : <ViewIcon />}</ViewIconContainer>}
                onClick={() => {
                  setIsViewMnemonic(!isViewMnemonic);
                }}
              >
                <MarginRightTypography variant="h4_B">{t('components.MnemonicViewer.index.seedPhrase')}</MarginRightTypography>
              </IconTextButton>
              <IconTextButton
                onClick={(event) => {
                  setIsOpenPopover(true);
                  setPopoverAnchorEl(event.currentTarget);
                }}
                trailingIcon={
                  <BottomChevronIconContainer>
                    <BottomChevronIcon />
                  </BottomChevronIconContainer>
                }
              >
                <MarginRightTypography variant="b3_M">
                  {values.length === 12 ? t('components.MnemonicViewer.index.twelveWords') : t('components.MnemonicViewer.index.twentyFourWords')}
                </MarginRightTypography>
              </IconTextButton>
            </TopContainer>
            <MnemonicInputContainer>
              {values.map((value, index) => (
                <StyledInput
                  key={index}
                  value={value}
                  type={isViewMnemonic ? 'text' : inputTypes[index]}
                  startAdornment={
                    <InputAdornment position="start">
                      <MnemonicWordIndexText variant="h5n_M">{index + 1}</MnemonicWordIndexText>
                    </InputAdornment>
                  }
                  hideViewIcon
                  error={!!value && !mnemonicWordList.includes(value)}
                  onFocus={() => handleFocusMnemonicInput(index)}
                  onBlur={() => handleBlurMnemonicInput(index)}
                  onChange={(e) => {
                    if (e.target.value.endsWith(' ')) {
                      return;
                    }

                    updateMnemonicWords(index, e.target.value);
                  }}
                />
              ))}
            </MnemonicInputContainer>
            <ControlInputButtonContainer>
              {isAnyMnemonicPresent ? (
                <StyledIconTextButton
                  leadingIcon={
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
                  leadingIcon={
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
          <Button
            disabled={!isFormComplete}
            isProgress={isLoadingBalance}
            onClick={() => {
              const joinedMnemonicPhrase = values.join(' ');

              const isValidMnemonicPhrase = bip39.validateMnemonic(joinedMnemonicPhrase);

              if (!isValidMnemonicPhrase) {
                toastError(t('pages.account.restore-wallet.mnemonic.index.invalidMnemonicPhrase'));
                return;
              }

              setIsOpenSetAccountNameBottomSheet(true);
            }}
          >
            {t('pages.account.restore-wallet.mnemonic.index.next')}
          </Button>
        </>
      </BaseFooter>
      <MnemonicBitsPopover
        open={isOpenPopover}
        onClose={() => {
          setIsOpenPopover(false);
        }}
        onClickMnemonicBits={(bits) => {
          handleMnemonicBitChange(bits);
          setIsOpenPopover(false);
        }}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      />
      <HdPathBottomSheet
        currentHdPathIndex={currentHdPathIndex}
        open={isOpenHdPathBottomSheet}
        onClose={() => setIsOpenHdPathBottomSheet(false)}
        onChangeHdPathIndex={(val) => {
          setCurrentHdPathIndex(val);
        }}
      />
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        setName={async (accountName) => {
          await setUpAccount(accountName);
        }}
      />
    </>
  );
}
