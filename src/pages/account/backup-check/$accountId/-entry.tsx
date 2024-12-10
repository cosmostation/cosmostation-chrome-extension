import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import SetAccountNameBottomSheet from '@/components/SetAccountNameBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as Dashboard } from '@/pages/index';
import type { AccountWithName } from '@/types/account';
import { addAccountName } from '@/utils/accountNames';
import { toastError, toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Container } from './-styled';

type EntryProps = {
  accountId: string;
};

export default function Entry({ accountId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);
  const { accounts, mnemonicNamesByHashedMnemonic, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { setCurrentAccount } = useCurrentAccount();

  // TODO 어카운트롤 추가하는건 일반 니모닉 백업 과정에서는 필요없는 로직임으로 추후 수정 필요.
  const setUp = async (newAccountName: string) => {
    try {
      const account = accounts.find((account) => account.id === accountId) || accounts[accounts.length - 1];

      const newAccount: AccountWithName = {
        ...account,
        name: newAccountName,
      };

      await setCurrentAccount(newAccount.id);
      // TODO
      // await setExtensionStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);
      await addAccountName(account.id, newAccountName);

      const totalMnemonicAccountsCount = accounts.filter((account) => account.type === 'MNEMONIC').length;

      await updateExtensionStorageStore('mnemonicNamesByHashedMnemonic', {
        ...mnemonicNamesByHashedMnemonic,
        [newAccount.encryptedRestoreString]: `Mnemonic ${totalMnemonicAccountsCount}`,
      });

      navigate({
        to: Dashboard.to,
      });

      toastSuccess('pages.account.backup-check.entry.setupSuccess');
    } catch {
      toastError('pages.account.backup-check.entry.setupError');
    }
  };

  return (
    <>
      <BaseBody>
        <Container>splash screen</Container>
      </BaseBody>
      <BaseFooter>
        <Button
          onClick={() => {
            setIsOpenSetAccountNameBottomSheet(true);
          }}
        >
          {t('pages.account.backup-check.entry.next')}
        </Button>
      </BaseFooter>
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
