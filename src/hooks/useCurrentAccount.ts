import { useTranslation } from 'react-i18next';

import type { Account, AccountWithName } from '@/types/account';
import { toastError, toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useCurrentAccount() {
  const { t } = useTranslation();
  const { accounts, accountNamesById, mnemonicNamesByHashedMnemonic, selectedAccountId, notBackedUpAccountIds, updateExtensionStorageStore } =
    useExtensionStorageStore((state) => state);

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
      const encryptedRestoreString = accounts.find((acc) => acc.id === id)?.encryptedRestoreString;
      const newAccounts = accounts.filter((acc) => acc.id !== id);

      if (id === selectedAccountId) {
        await updateExtensionStorageStore('selectedAccountId', newAccounts?.[0]?.id ?? '');
      }

      await updateExtensionStorageStore('accounts', newAccounts);

      const deepCopiedAccountName = { ...accountNamesById };

      delete deepCopiedAccountName[id];

      await updateExtensionStorageStore('accountNamesById', deepCopiedAccountName);

      if (!newAccounts.some((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === encryptedRestoreString)) {
        const deepCopiedMnemonicNamesByHashedMnemonic = { ...mnemonicNamesByHashedMnemonic };

        delete deepCopiedMnemonicNamesByHashedMnemonic[id];

        await updateExtensionStorageStore('mnemonicNamesByHashedMnemonic', deepCopiedMnemonicNamesByHashedMnemonic);
      }

      if (notBackedUpAccountIds.includes(id)) {
        await updateExtensionStorageStore(
          'notBackedUpAccountIds',
          notBackedUpAccountIds.filter((accountId) => accountId !== id),
        );
      }

      toastSuccess(t('hooks.useCurrentAccount.removeAccountSuccess'));

      // TODO 어카운트 별 어드레스. 밸런스 삭제 로직 추가
      // TODO initAccountIds 삭제 로직 추가
    } catch {
      toastError(t('hooks.useCurrentAccount.removeAccountError'));
    }
  };

  const removeMnemonic = async (mnemonicId: string) => {
    try {
      const targetAccounts = accounts.filter((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === mnemonicId);
      const newAccounts = accounts.filter((account) => !targetAccounts.map(({ id }) => id).includes(account.id));

      if (!newAccounts.map(({ id }) => id).includes(selectedAccountId)) {
        await updateExtensionStorageStore('selectedAccountId', newAccounts?.[0]?.id ?? '');
      }

      await updateExtensionStorageStore('accounts', newAccounts);

      const deepCopiedAccountName = { ...accountNamesById };

      targetAccounts.forEach((account) => {
        delete deepCopiedAccountName[account.id];
      });

      await updateExtensionStorageStore('accountNamesById', deepCopiedAccountName);

      const deepCopiedMnemonicNamesByHashedMnemonic = { ...mnemonicNamesByHashedMnemonic };

      delete deepCopiedMnemonicNamesByHashedMnemonic[mnemonicId];

      await updateExtensionStorageStore('mnemonicNamesByHashedMnemonic', deepCopiedMnemonicNamesByHashedMnemonic);

      const newNotBackedUpAccountIds = notBackedUpAccountIds.filter((accountId) => newAccounts.map(({ id }) => id).includes(accountId));

      await updateExtensionStorageStore('notBackedUpAccountIds', newNotBackedUpAccountIds);

      // TODO 어카운트 별 어드레스. 밸런스 삭제 로직 추가
      // TODO initAccountIds 삭제 로직 추가

      toastSuccess(t('hooks.useCurrentAccount.removeMnemonicSuccess'));
    } catch {
      toastError(t('hooks.useCurrentAccount.removeMnemonicError'));
    }
  };

  return { currentAccount: currentAccountWithName, setCurrentAccount, addAccount, removeMnemonic, addAccountWithName, removeAccount };
}
