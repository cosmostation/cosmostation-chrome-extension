import type { Account, AccountWithName } from '@/types/account';
import { removeMnemonicName } from '@/utils/mnemonicNames';
import { removeAccountName, removeAccountNames } from '@/utils/zustand/accountNames';
import { removeAccountFromNotBackedupList, removeAccountFromNotBackedupLists } from '@/utils/zustand/backupAccount';
import { removeInitAccountId, removeInitAccountIds } from '@/utils/zustand/initAccountIds';
import { removePreferAccountType, removePreferAccountTypes } from '@/utils/zustand/preferAccountType';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useCurrentAccount() {
  const { accounts, accountNamesById, selectedAccountId, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);

  const currentAccount = selectedAccount || accounts[0];

  const currentAccountName = accountNamesById[currentAccount?.id] ?? '';

  const currentAccountWithName = { ...currentAccount, name: currentAccountName };

  const setCurrentAccount = async (id: string) => {
    if (selectedAccountId === id) return;

    await updateExtensionStorageStore('selectedAccountId', id);
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
    const encryptedRestoreString = accounts.find((acc) => acc.id === id)?.encryptedRestoreString;
    const newAccounts = accounts.filter((acc) => acc.id !== id);

    if (id === selectedAccountId) {
      await updateExtensionStorageStore('selectedAccountId', newAccounts?.[0]?.id ?? '');
    }

    await updateExtensionStorageStore('accounts', newAccounts);

    await removeAccountName(id);
    await removeAccountFromNotBackedupList(id);
    await removePreferAccountType(id);
    await removeInitAccountId(id);

    if (encryptedRestoreString && !newAccounts.some((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === encryptedRestoreString)) {
      await removeMnemonicName(encryptedRestoreString);
    }

    await chrome.storage.local.remove([
      `${id}-address`,
      `${id}-balance-cosmos`,
      `${id}-balance-evm`,
      `${id}-balance-aptos`,
      `${id}-balance-sui`,
      `${id}-balance-erc20`,
      `${id}-balance-cw20`,
      `${id}-hidden-assetIds`,
    ]);
  };

  const removeMnemonic = async (mnemonicId: string) => {
    const targetAccounts = accounts.filter((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === mnemonicId);
    const targetAccountsIds = accounts.filter((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === mnemonicId).map(({ id }) => id);
    const updatedAccounts = accounts.filter((account) => !targetAccounts.map(({ id }) => id).includes(account.id));

    if (!updatedAccounts.map(({ id }) => id).includes(selectedAccountId)) {
      await updateExtensionStorageStore('selectedAccountId', updatedAccounts?.[0]?.id ?? '');
    }

    await updateExtensionStorageStore('accounts', updatedAccounts);

    await removeMnemonicName(mnemonicId);
    await removeAccountNames(targetAccountsIds);
    await removeAccountFromNotBackedupLists(targetAccountsIds);
    await removePreferAccountTypes(targetAccountsIds);
    await removeInitAccountIds(targetAccountsIds);

    targetAccounts.forEach(async ({ id }) => {
      await chrome.storage.local.remove([
        `${id}-address`,
        `${id}-balance-cosmos`,
        `${id}-balance-evm`,
        `${id}-balance-aptos`,
        `${id}-balance-sui`,
        `${id}-balance-erc20`,
        `${id}-balance-cw20`,
        `${id}-hidden-assetIds`,
      ]);
    });
  };

  return {
    currentAccount: currentAccountWithName,
    setCurrentAccount,
    addAccount,
    removeMnemonic,
    addAccountWithName,
    removeAccount,
  };
}
