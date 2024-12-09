import { useTranslation } from 'react-i18next';

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

  return { currentAccount: currentAccountWithName, setCurrentAccount, removeAccount };
}
