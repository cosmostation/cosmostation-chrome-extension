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
import SetAccountNameBottomSheet from '@/components/SetAccountNameBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { getPassword } from '@/libs/account';
import { sendMessage } from '@/libs/extension';
import { Route as Init } from '@/pages/account/initial';
import { Route as CoinTypeSetting } from '@/pages/account/restore-wallet/coin-type-setting';
import { Route as Dashboard } from '@/pages/index';
import type { Account, AccountWithName } from '@/types/account';
import { aesDecrypt, aesEncrypt } from '@/utils/crypto';
import { sha512 } from '@/utils/crypto/password';
import { toastError, toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useNewPasswordStore } from '@/zustand/hooks/useNewPasswordStore';

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

  const { accounts, mnemonicNamesByHashedMnemonic, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { addAccount, addAccountWithName, setCurrentAccount } = useCurrentAccount();
  const { password, key, timestamp } = useNewPasswordStore((state) => state);

  const [isViewMnemonic, setIsViewMnemonic] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);

  const [isOpenHdPathBottomSheet, setIsOpenHdPathBottomSheet] = useState(false);
  const [currentHdPathIndex, setCurrentHdPathIndex] = useState('0');

  const [values, setValues] = useState<string[]>(Array(12).fill(''));

  const isInitialSetup = accounts.length === 0;

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

  // NOTE v11 다 저장안되는 경우도 있음.
  // TODO params, assetv11다 로딩안됐으면 여기서 다시 await해야할듯.
  const setUp = async (newAccountName: string) => {
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
        mnemonic: encryptedMnemonic,
        encryptedRestoreString,
      };

      await addAccountWithName(newAccount);

      const isMnemonicAlreadyRegistered = mnemonicNamesByHashedMnemonic[encryptedRestoreString];

      const totalMnemonicAccountsCount = accounts.filter((account) => account.type === 'MNEMONIC').length;

      if (!isMnemonicAlreadyRegistered) {
        await updateExtensionStorageStore('mnemonicNamesByHashedMnemonic', {
          ...mnemonicNamesByHashedMnemonic,
          [encryptedRestoreString]: `Mnemonic ${totalMnemonicAccountsCount + 1}`,
        });
      }

      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [newAccount.id] });
      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [newAccount.id] });

      await setCurrentAccount(newAccount.id);

      // TODO
      // await setExtensionStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);

      navigate({
        to: Dashboard.to,
      });

      toastSuccess(t('pages.account.restore-wallet.mnemonic.index.accountCreated'));
    } catch {
      toastError(t('pages.account.restore-wallet.mnemonic.index.addressAndBalanceFetchingError'));
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const setUpInitial = async () => {
    try {
      if (isInitialSetup && !password) {
        toastError(t('pages.account.restore-wallet.mnemonic.index.passwordNotSet'));

        navigate({
          to: Init.to,
        });
      }

      setIsLoadingBalance(true);

      const joinedMnemonicPhrase = values.join(' ');

      const accountId = uuidv4();

      const decryptedPassword = aesDecrypt(password, `${key}${timestamp}`);

      const encryptedMnemonic = aesEncrypt(joinedMnemonicPhrase, decryptedPassword);
      const encryptedRestoreString = sha512(joinedMnemonicPhrase);

      const newAccount: Account = {
        id: accountId,
        type: 'MNEMONIC',
        index: currentHdPathIndex,
        mnemonic: encryptedMnemonic,
        encryptedRestoreString,
      };

      const comparisonPasswordHash = sha512(decryptedPassword);
      await updateExtensionStorageStore('comparisonPasswordHash', comparisonPasswordHash);

      await updateExtensionStorageStore('password', {
        encryptedPassword: password,
        key,
        timestamp,
      });

      await addAccount(newAccount);

      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [accountId] });
      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [accountId] });

      // NOTE 추후에 코인타입세터 넘길지 말지 초건 추가

      navigate({
        to: CoinTypeSetting.to,
      });
    } catch {
      toastError(t('pages.account.restore-wallet.mnemonic.index.addressAndBalanceFetchingError'));
    } finally {
      setIsLoadingBalance(false);
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
                <MarginRightTypography variant="b2_M">{t('components.MnemonicViewer.index.seedPhrase')}</MarginRightTypography>
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
                      <MnemonicWordIndexText variant="h5n_M">{index}</MnemonicWordIndexText>
                    </InputAdornment>
                  }
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

              if (isInitialSetup) {
                setUpInitial();
              } else {
                setIsOpenSetAccountNameBottomSheet(true);
              }
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
        currentHdPath={currentHdPathIndex}
        open={isOpenHdPathBottomSheet}
        onClose={() => setIsOpenHdPathBottomSheet(false)}
        onChangeHpPath={(val) => setCurrentHdPathIndex(val)}
      />
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        setAccountName={async (accountName) => {
          await setUp(accountName);
        }}
      />
    </>
  );
}
