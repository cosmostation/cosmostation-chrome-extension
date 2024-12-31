import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import type { CheckWord } from '@/components/MnemnicBackupChecker';
import MnemnicBackupChecker from '@/components/MnemnicBackupChecker';
import type { MnemonicCheckForm } from '@/components/MnemnicBackupChecker/useSchema';
import { useSchema } from '@/components/MnemnicBackupChecker/useSchema';
import SetAccountNameBottomSheet from '@/components/SetNameBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { sendMessage } from '@/libs/extension';
import { Route as Dashboard } from '@/pages/index';
import type { AccountWithName } from '@/types/account';
import { aesDecrypt } from '@/utils/crypto';
import { sha512 } from '@/utils/crypto/password';
import { toastError, toastSuccess } from '@/utils/toast';
import { addAccountName } from '@/utils/zustand/accountNames';
import { addPreferAccountType } from '@/utils/zustand/preferAccountType';
import { loadExtensionStorageStoreFromStorage, useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useNewAccountStore } from '@/zustand/hooks/useNewAccountStore';

import { DescriptionContainer, DescriptionSubTitle, DescriptionTitle, FormContainer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);
  const { accounts, mnemonicNamesByHashedMnemonic, comparisonPasswordHash, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { setCurrentAccount, addAccountWithName } = useCurrentAccount();
  const { account } = useNewAccountStore();

  const { currentPassword } = useCurrentPassword();

  const [isLoadingBackup, setIsLoadingBackup] = useState(false);

  const decryptedMnemonic = account?.type === 'MNEMONIC' ? aesDecrypt(account.encryptedMnemonic, currentPassword!) : '';

  const splitedMnemonic = useMemo(() => decryptedMnemonic.split(' '), [decryptedMnemonic]);

  const mnemonicLength = useMemo(() => splitedMnemonic.length, [splitedMnemonic.length]);

  const checkMnemonicIndexes = useMemo(() => {
    const indexes: number[] = [];

    while (true) {
      if (!decryptedMnemonic || indexes.length > 2) break;
      const index = Math.floor(Math.random() * mnemonicLength);

      if (!indexes.includes(index)) {
        indexes.push(index);
      }
    }

    return indexes.sort((a, b) => a - b);
  }, [decryptedMnemonic, mnemonicLength]);

  const checkWords: CheckWord[] = useMemo(
    () => checkMnemonicIndexes.map((idx) => ({ index: idx, word: splitedMnemonic[idx] })),
    [checkMnemonicIndexes, splitedMnemonic],
  );

  const { mnemonicCheckForm } = useSchema({ words: checkWords });

  const { handleSubmit, setValue, watch, reset } = useForm<MnemonicCheckForm>({
    resolver: joiResolver(mnemonicCheckForm),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    shouldFocusError: true,
  });

  const watchWords = watch();
  const isDisabledButton = Object.values(watchWords).length !== 3;

  const error = () => toastError(t('pages.account.backup-check.entry.incorrect'));

  const submit = async () => {
    setIsOpenSetAccountNameBottomSheet(true);
  };
  // TODO 어카운트롤 추가하는건 일반 니모닉 백업 과정에서는 필요없는 로직임으로 추후 수정 필요.
  const setUp = async (newAccountName: string) => {
    try {
      setIsLoadingBackup(true);

      const newAccount: AccountWithName = {
        ...account,
        name: newAccountName,
      };

      if (!comparisonPasswordHash) {
        const comparisonPasswordHash = sha512(currentPassword!);
        await updateExtensionStorageStore('comparisonPasswordHash', comparisonPasswordHash);
      }

      await addAccountWithName(newAccount);

      await addPreferAccountType(newAccount.id);

      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [newAccount.id] });
      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [newAccount.id] });

      await setCurrentAccount(newAccount.id);

      // TODO
      // await setExtensionStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);
      await addAccountName(account.id, newAccountName);

      const totalMnemonicAccountsCount = accounts.filter((account) => account.type === 'MNEMONIC').length;

      await updateExtensionStorageStore('mnemonicNamesByHashedMnemonic', {
        ...mnemonicNamesByHashedMnemonic,
        [newAccount.encryptedRestoreString]: `Mnemonic ${totalMnemonicAccountsCount}`,
      });

      await loadExtensionStorageStoreFromStorage();

      navigate({
        to: Dashboard.to,
      });

      toastSuccess(t('pages.account.backup-check.entry.setUpComplete'));
      reset();
    } catch {
      toastError(t('pages.account.backup-check.entry.setupError'));
    } finally {
      setIsLoadingBackup(false);
    }
  };

  return (
    <>
      <FormContainer onSubmit={handleSubmit(submit, error)}>
        <BaseBody>
          <>
            <DescriptionContainer>
              <DescriptionTitle variant="h2_B">{t('pages.account.backup-check.entry.title')}</DescriptionTitle>
              <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.account.backup-check.entry.subTitle')}</DescriptionSubTitle>
            </DescriptionContainer>
            <MnemnicBackupChecker
              mnemonic={decryptedMnemonic}
              checkWords={checkWords}
              onClickFirstAnswer={(word) => {
                setValue(`word${checkWords[0].index}`, word);
              }}
              onClickSecondAnswer={(word) => {
                setValue(`word${checkWords[1].index}`, word);
              }}
              onClickThirdAnswer={(word) => {
                setValue(`word${checkWords[2].index}`, word);
              }}
            />
          </>
        </BaseBody>
        <BaseFooter>
          <Button type="submit" disabled={isDisabledButton} isProgress={isLoadingBackup}>
            {t('pages.account.backup-check.entry.next')}
          </Button>
        </BaseFooter>
      </FormContainer>
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        setName={async (accountName) => {
          await setUp(accountName);
        }}
      />
    </>
  );
}
