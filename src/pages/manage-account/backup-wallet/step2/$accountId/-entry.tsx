import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { joiResolver } from '@hookform/resolvers/joi';
import { useRouter } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import type { CheckWord } from '@/components/MnemnicBackupChecker';
import MnemnicBackupChecker from '@/components/MnemnicBackupChecker';
import type { MnemonicCheckForm } from '@/components/MnemnicBackupChecker/useSchema';
import { useSchema } from '@/components/MnemnicBackupChecker/useSchema';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { aesDecrypt } from '@/utils/crypto';
import { toastError, toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { DescriptionContainer, DescriptionSubTitle, DescriptionTitle, FormContainer } from './-styled';

type EntryProps = {
  accountId: string;
};

export default function Entry({ accountId }: EntryProps) {
  const { t } = useTranslation();
  const { history } = useRouter();

  const { userAccounts, notBackedUpAccountIds, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { currentPassword } = useCurrentPassword();

  const account = userAccounts.find((account) => account.id === accountId) || userAccounts[userAccounts.length - 1];

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

  const submit = async () => {
    const updatedNotBackedUpAccountIds = notBackedUpAccountIds.filter((id) => id !== account.id);

    await updateExtensionStorageStore('notBackedUpAccountIds', updatedNotBackedUpAccountIds);

    reset();

    toastSuccess(t('pages.manage-account.backup-wallet.step2.entry.success'));

    history.go(-2);
  };

  const error = () => toastError(t('pages.manage-account.backup-wallet.step2.entry.incorrect'));

  return (
    <FormContainer onSubmit={handleSubmit(submit, error)}>
      <BaseBody>
        <>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.manage-account.backup-wallet.step2.entry.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.manage-account.backup-wallet.step2.entry.subTitle')}</DescriptionSubTitle>
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
        <Button type={'submit'} disabled={isDisabledButton}>
          {t('pages.manage-account.backup-wallet.step2.entry.backupComplete')}
        </Button>
      </BaseFooter>
    </FormContainer>
  );
}
