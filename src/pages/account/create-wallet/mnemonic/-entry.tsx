import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as bip39 from 'bip39';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import MnemonicViewer from '@/components/MnemonicViewer';
import SetAccountNameBottomSheet from '@/components/SetAccountNameBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { sendMessage } from '@/libs/extension';
import { Route as Init } from '@/pages/account/initial';
import { Route as Dashboard } from '@/pages/index';
import type { AccountWithName } from '@/types/account';
import { aesDecrypt, aesEncrypt } from '@/utils/crypto';
import { sha512 } from '@/utils/crypto/password';
import { toastError, toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useNewPasswordStore } from '@/zustand/hooks/useNewPasswordStore';

import { Body, DescriptionContainer, DescriptionSubTitle, DescriptionTitle } from './-styled';

const mnemonicBits = {
  12: 128,
  24: 256,
} as const;

export type MnemonicBits = ValueOf<typeof mnemonicBits>;

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { accounts, mnemonicNamesByHashedMnemonic, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { currentPassword, setCurrentPassword } = useCurrentPassword();

  const { addAccountWithName, setCurrentAccount } = useCurrentAccount();

  const isInitialSetup = accounts.length === 0;

  const { password, key, timestamp } = useNewPasswordStore((state) => state);

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [bits, setBits] = useState<MnemonicBits>(mnemonicBits[12]);
  const mnemonic = useMemo(() => bip39.generateMnemonic(bits), [bits]);

  const createMnemonicAccount = async (newAccountName: string) => {
    try {
      if (isInitialSetup && !password) {
        toastError(t('pages.account.create-mnemonic.mnemonic.index.passwordNotSet'));

        navigate({
          to: Init.to,
        });
      }

      setIsLoading(true);
      const accountId = uuidv4();

      const decryptedPassword = (() => {
        if (isInitialSetup) {
          return aesDecrypt(password, `${key}${timestamp}`);
        }

        if (!currentPassword) {
          throw new Error('currentPassword is null');
        }

        return currentPassword;
      })();

      const encryptedMnemonic = aesEncrypt(mnemonic, decryptedPassword);
      const encryptedRestoreString = sha512(mnemonic);

      const newAccount: AccountWithName = {
        id: accountId,
        type: 'MNEMONIC',
        name: newAccountName,
        index: '0',
        mnemonic: encryptedMnemonic,
        encryptedRestoreString,
      };

      if (isInitialSetup) {
        const comparisonPasswordHash = sha512(decryptedPassword);
        await updateExtensionStorageStore('comparisonPasswordHash', comparisonPasswordHash);

        await setCurrentPassword(decryptedPassword);
      }

      await addAccountWithName(newAccount);

      const totalMnemonicAccountsCount = accounts.filter((account) => account.type === 'MNEMONIC').length;

      if (totalMnemonicAccountsCount === 0) {
        await updateExtensionStorageStore('mnemonicNamesByHashedMnemonic', {
          ...mnemonicNamesByHashedMnemonic,
          [encryptedRestoreString]: `Mnemonic ${totalMnemonicAccountsCount + 1}`,
        });
      } else {
        await updateExtensionStorageStore('mnemonicNamesByHashedMnemonic', {
          ...mnemonicNamesByHashedMnemonic,
          [encryptedRestoreString]: `Mnemonic ${totalMnemonicAccountsCount + 1}`,
        });
      }

      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [newAccount.id] });
      // TODO 니모닉 생성은 밸런스가 없으니 밸런스 업데이트는 필요없음
      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [newAccount.id] });

      await setCurrentAccount(newAccount.id);

      navigate({
        to: Dashboard.to,
      });

      toastSuccess(t('pages.account.create-mnemonic.mnemonic.index.success'));
    } catch {
      toastError(t('pages.account.create-mnemonic.mnemonic.index.failed'));
    } finally {
      setIsLoading(false);
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
        <Button
          onClick={() => {
            setIsOpenSetAccountNameBottomSheet(true);
          }}
          isProgress={isLoading}
        >
          {t('pages.account.create-mnemonic.mnemonic.index.next')}
        </Button>
      </BaseFooter>
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        setAccountName={(accountName) => {
          createMnemonicAccount(accountName);
        }}
      />
    </>
  );
}
