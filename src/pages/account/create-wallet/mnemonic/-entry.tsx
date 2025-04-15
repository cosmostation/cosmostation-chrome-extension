import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as bip39 from 'bip39';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import MnemonicViewer from '@/components/MnemonicViewer';
import SetAccountNameBottomSheet from '@/components/SetNameBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { Route as BackUpCheck } from '@/pages/account/backup-check/$accountId';
import { Route as Init } from '@/pages/account/initial';
import { Route as Dashboard } from '@/pages/index';
import type { Account, AccountWithName } from '@/types/account';
import { aesEncrypt } from '@/utils/crypto';
import { sha512 } from '@/utils/crypto/password';
import { toastError } from '@/utils/toast';
import { addAccountToNotBackedupList } from '@/utils/zustand/backupAccount';
import { addPreferAccountType } from '@/utils/zustand/preferAccountType';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useNewAccountStore } from '@/zustand/hooks/useNewAccountStore';

import { Body, DescriptionContainer, DescriptionSubTitle, DescriptionTitle } from './-styled';

const mnemonicBits = {
  12: 128,
  18: 192,
  24: 256,
} as const;

export type MnemonicBits = ValueOf<typeof mnemonicBits>;

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userAccounts, comparisonPasswordHash, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { updateNewAccount } = useNewAccountStore();
  const { currentPassword } = useCurrentPassword();

  const { addAccountWithName, setCurrentAccount } = useCurrentAccount();

  const isInitialSetup = userAccounts.length === 0;

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);
  const [isLoadingBackup, setIsLoadingBackup] = useState(false);
  const [isLoadingWithoutBackup, setIsLoadingWithoutBackup] = useState(false);

  const [bits, setBits] = useState<MnemonicBits>(mnemonicBits[12]);
  const mnemonic = useMemo(() => bip39.generateMnemonic(bits), [bits]);

  const setUpWithoutCheck = async (newAccountName: string) => {
    try {
      if (isInitialSetup && !currentPassword) {
        toastError(t('pages.account.create-mnemonic.mnemonic.index.passwordNotSet'));

        navigate({
          to: Init.to,
        });
      }

      setIsLoadingWithoutBackup(true);
      const accountId = uuidv4();

      const encryptedMnemonic = aesEncrypt(mnemonic, currentPassword!);
      const encryptedRestoreString = sha512(mnemonic);

      const newAccount: AccountWithName = {
        id: accountId,
        type: 'MNEMONIC',
        name: newAccountName,
        index: '0',
        encryptedMnemonic: encryptedMnemonic,
        encryptedRestoreString,
      };

      if (!comparisonPasswordHash) {
        const comparisonPasswordHash = sha512(currentPassword!);
        await updateExtensionStorageStore('comparisonPasswordHash', comparisonPasswordHash);
      }

      await addAccountWithName(newAccount);

      await addPreferAccountType(newAccount.id);

      await setCurrentAccount(newAccount.id);

      await addAccountToNotBackedupList(newAccount.id);

      navigate({
        to: Dashboard.to,
      });
    } catch {
      toastError(t('pages.account.create-mnemonic.mnemonic.index.failed'));
    } finally {
      setIsLoadingWithoutBackup(false);
    }
  };

  const setUpWithCheck = async () => {
    try {
      if (isInitialSetup && !currentPassword) {
        toastError(t('pages.account.create-mnemonic.mnemonic.index.passwordNotSet'));

        navigate({
          to: Init.to,
        });
      }

      setIsLoadingBackup(true);

      const accountId = uuidv4();

      const encryptedMnemonic = aesEncrypt(mnemonic, currentPassword!);
      const encryptedRestoreString = sha512(mnemonic);

      const newAccount: Account = {
        id: accountId,
        type: 'MNEMONIC',
        index: '0',
        encryptedMnemonic: encryptedMnemonic,
        encryptedRestoreString,
      };

      updateNewAccount(newAccount);

      navigate({
        to: BackUpCheck.to,
        params: {
          accountId: newAccount.id,
        },
      });
    } catch {
      toastError(t('pages.account.create-mnemonic.mnemonic.index.failed'));
    } finally {
      setIsLoadingBackup(false);
    }
  };

  return (
    <>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.account.create-mnemonic.mnemonic.index.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.account.create-mnemonic.mnemonic.index.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>
          <MnemonicViewer
            rawMnemonic={mnemonic}
            onClickMnemonicBits={(val) => {
              setBits(val);
            }}
          />
        </Body>
      </BaseBody>
      <BaseFooter>
        <SplitButtonsLayout
          cancelButton={
            <Button
              onClick={() => {
                setIsOpenSetAccountNameBottomSheet(true);
              }}
              disabled={isLoadingBackup}
              isProgress={isLoadingWithoutBackup}
              variant="dark"
            >
              {t('pages.account.create-mnemonic.mnemonic.index.setUpLater')}
            </Button>
          }
          confirmButton={
            <Button
              onClick={() => {
                setUpWithCheck();
              }}
              disabled={isLoadingWithoutBackup}
              isProgress={isLoadingBackup}
            >
              {t('pages.account.create-mnemonic.mnemonic.index.backup')}
            </Button>
          }
        />
      </BaseFooter>
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        setName={(accountName) => {
          setUpWithoutCheck(accountName);
        }}
      />
    </>
  );
}
