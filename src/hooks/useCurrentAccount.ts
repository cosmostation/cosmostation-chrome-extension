import { useTranslation } from 'react-i18next';

import type { Account, AccountWithName } from '@/types/account';
import { toastError } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useCurrentAccount() {
  const { t } = useTranslation();
  const { accounts, accountNamesById, selectedAccountId, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);

  const currentAccount = selectedAccount || accounts[0];

  const currentAccountName = accountNamesById[currentAccount?.id] ?? '';

  const currentAccountWithName = { ...currentAccount, name: currentAccountName };

  const setCurrentAccount = async (id: string) => {
    try {
      if (selectedAccountId === id) return;

      await updateExtensionStorageStore('selectedAccountId', id);
    } catch {
      toastError(t('hooks.useCurrentAccount.setCurrentAccountError'));
    }
  };

  const addAccount = async (account: Account) => {
    await updateExtensionStorageStore('accounts', [...accounts, account]);
  };

  const addAccountWithName = async (accountInfo: AccountWithName) => {
    const { name, ...account } = accountInfo;

    await updateExtensionStorageStore('accounts', [...accounts, account]);
    await updateExtensionStorageStore('accountNamesById', { ...accountNamesById, [account.id]: name });
  };

  const removeAccount = async (id: string) => {
    try {
      const newAccounts = accounts.filter((acc) => acc.id !== id);

      if (id === selectedAccountId) {
        await updateExtensionStorageStore('selectedAccountId', newAccounts?.[0]?.id ?? '');
      }

      await updateExtensionStorageStore('accounts', newAccounts);

      const deepCopiedAccountName = { ...accountNamesById };

      delete deepCopiedAccountName[id];

      await updateExtensionStorageStore('accountNamesById', deepCopiedAccountName);
    } catch {
      toastError(t('hooks.useCurrentAccount.removeAccountError'));
    }
  };

  return { currentAccount: currentAccountWithName, setCurrentAccount, addAccount, addAccountWithName, removeAccount };
}
