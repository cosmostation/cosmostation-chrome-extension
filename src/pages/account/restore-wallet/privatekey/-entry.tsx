import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { joiResolver } from '@hookform/resolvers/joi';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import IconTextButton from '@/components/common/IconTextButton';
import SetAccountNameBottomSheet from '@/components/SetNameBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { Route as Dashboard } from '@/pages/index';
import type { Account, AccountWithName, PrivateAccount } from '@/types/account';
import { aesEncrypt } from '@/utils/crypto';
import { sha512 } from '@/utils/crypto/password';
import { toastError } from '@/utils/toast';
import { addPreferAccountType } from '@/utils/zustand/preferAccountType';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  Body,
  ControlInputButtonContainer,
  ControlInputText,
  DescriptionContainer,
  DescriptionSubTitle,
  DescriptionTitle,
  FormContainer,
  IconContainer,
  MarginRightTypography,
  PrivateKeyInputWrapper,
  StyledIconTextButton,
  StyledOutlinedInput,
  TopContainer,
  ViewIconContainer,
} from './-styled';
import type { PrivateKeyForm } from './-useSchema';
import { useSchema } from './-useSchema';

import ClearIcon from '@/assets/images/icons/Clear16.svg';
import PasteIcon from '@/assets/images/icons/Paste18.svg';
import ViewIcon from '@/assets/images/icons/View12.svg';
import ViewHideIcon from '@/assets/images/icons/ViewHide20.svg';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);
  const [isLoadingSetUp, setIsLoadingSetUp] = useState(false);

  const [inputPrivateKeyForm, setInputPrivateKeyForm] = useState<PrivateKeyForm>();

  const [isViewPrivateKey, setIsViewPrivateKey] = useState(false);

  const { userAccounts, comparisonPasswordHash, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { addAccountWithName, setCurrentAccount } = useCurrentAccount();
  const { currentPassword } = useCurrentPassword();

  const { privateKeyForm } = useSchema();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PrivateKeyForm>({
    resolver: joiResolver(privateKeyForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const { ref, ...remainder } = register('privateKey');

  const { privateKey } = watch();
  const isPrivateKeyEntered = !!privateKey;

  const pasteFromClipboard = async () => {
    const clipboard = await navigator.clipboard.readText();

    reset({
      privateKey: clipboard,
    });
  };

  const clearAll = () => {
    reset({
      privateKey: '',
    });
  };

  const submit = (data: PrivateKeyForm) => {
    setInputPrivateKeyForm(data);
    setIsOpenSetAccountNameBottomSheet(true);
  };

  const setUpAccount = async (accountName: string) => {
    try {
      setIsLoadingSetUp(true);

      if (!inputPrivateKeyForm) {
        toastError(t('pages.account.restore-wallet.privatekey.index.setUpError'));
        return;
      }

      const privateKey = inputPrivateKeyForm.privateKey.startsWith('0x') ? inputPrivateKeyForm.privateKey.substring(2) : inputPrivateKeyForm.privateKey;

      const privateKeyRestoreStrings = userAccounts.filter(isPrivateKeyAccount).map((account) => account.encryptedRestoreString);

      if (privateKeyRestoreStrings.includes(sha512(privateKey))) {
        toastError(t('pages.account.restore-wallet.privatekey.index.alreadyExist'));
        return;
      }

      const accountId = uuidv4();

      const newAccount: AccountWithName = {
        id: accountId,
        type: 'PRIVATE_KEY',
        encryptedPrivateKey: aesEncrypt(privateKey, currentPassword!),
        encryptedRestoreString: sha512(privateKey),
        name: accountName,
      };

      if (!comparisonPasswordHash) {
        const comparisonPasswordHash = sha512(currentPassword!);
        await updateExtensionStorageStore('comparisonPasswordHash', comparisonPasswordHash);
      }

      await addAccountWithName(newAccount);

      await addPreferAccountType(newAccount.id);

      await setCurrentAccount(newAccount.id);

      navigate({
        to: Dashboard.to,
      });

      reset();
    } catch {
      toastError(t('pages.account.restore-wallet.privatekey.index.setUpError'));
    } finally {
      setIsLoadingSetUp(false);
    }
  };

  useEffect(() => {
    if (errors.privateKey?.message) {
      toastError(errors.privateKey.message);
    }
  }, [errors]);

  return (
    <>
      <FormContainer onSubmit={handleSubmit(submit)}>
        <BaseBody>
          <Body>
            <DescriptionContainer>
              <DescriptionTitle variant="h2_B">{t('pages.account.restore-wallet.privatekey.index.title')}</DescriptionTitle>
              <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.account.restore-wallet.privatekey.index.subTitle')}</DescriptionSubTitle>
            </DescriptionContainer>
            <PrivateKeyInputWrapper>
              <TopContainer>
                <IconTextButton
                  trailingIcon={<ViewIconContainer>{isViewPrivateKey ? <ViewHideIcon /> : <ViewIcon />}</ViewIconContainer>}
                  onClick={() => {
                    setIsViewPrivateKey(!isViewPrivateKey);
                  }}
                >
                  <MarginRightTypography variant="h4_B">{t('pages.account.restore-wallet.privatekey.index.privateKey')}</MarginRightTypography>
                </IconTextButton>
              </TopContainer>

              <StyledOutlinedInput
                placeholder={t('pages.account.restore-wallet.privatekey.index.enterPrivateKey')}
                multiline
                minRows={5}
                type={isViewPrivateKey ? 'text' : 'password'}
                error={!!errors.privateKey}
                hideViewIcon
                inputRef={ref}
                {...remainder}
              />

              <ControlInputButtonContainer>
                {isPrivateKeyEntered ? (
                  <StyledIconTextButton
                    leadingIcon={
                      <IconContainer>
                        <ClearIcon />
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
          <Button type="submit" disabled={!isPrivateKeyEntered} isProgress={isLoadingSetUp}>
            {t('pages.account.restore-wallet.privatekey.index.next')}
          </Button>
        </BaseFooter>
      </FormContainer>
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        setName={(accountName) => {
          setUpAccount(accountName);
        }}
      />
    </>
  );
}

function isPrivateKeyAccount(item: Account): item is PrivateAccount {
  return item.type === 'PRIVATE_KEY';
}
