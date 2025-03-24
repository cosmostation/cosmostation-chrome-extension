import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { Account, AccountWithName } from '@/types/account';
import type { ApprovedSuiPermissionType } from '@/types/extension';
import { emitChangedAddressEvent } from '@/utils/event';
import { emitToWeb } from '@/utils/message';
import { removeMnemonicName } from '@/utils/mnemonicNames';
import { deleteKeysContainingString, getExtensionLocalStorage } from '@/utils/storage';
import { removeAccountName, removeAccountNames } from '@/utils/zustand/accountNames';
import { removeAccountFromNotBackedupList, removeAccountFromNotBackedupLists } from '@/utils/zustand/backupAccount';
import { removeInitAccountId, removeInitAccountIds } from '@/utils/zustand/initAccountIds';
import { removeInitCheckLegacyBalanceAccountId, removeInitCheckLegacyBalanceAccountIds } from '@/utils/zustand/initCheckLegacyBalanceAccountId';
import { removePreferAccountType, removePreferAccountTypes } from '@/utils/zustand/preferAccountType';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

export function useCurrentAccount() {
  const { accounts, accountNamesById, selectedAccountId, approvedOrigins, approvedSuiPermissions, updateExtensionStorageStore } = useExtensionStorageStore(
    (state) => state,
  );

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);

  const currentAccount = selectedAccount || accounts[0];

  const currentAccountName = accountNamesById[currentAccount?.id] ?? '';

  const currentAccountWithName = { ...currentAccount, name: currentAccountName };

  const setCurrentAccount = async (id: string) => {
    if (selectedAccountId === id) return;

    const storedAccounts = await getExtensionLocalStorage('accounts');
    const accounts = storedAccounts ?? [];

    const isExist = !!accounts.find((account) => account.id === id);

    const newAccountId = isExist ? id : accounts[0].id;

    await updateExtensionStorageStore('selectedAccountId', newAccountId);

    await emitChangedAddressEvent(newAccountId);
  };

  const addAccount = async (account: Account) => {
    const storedAccounts = await getExtensionLocalStorage('accounts');
    const accounts = storedAccounts ?? [];

    const filteredAccounts = accounts.filter((item) => item.id !== account.id);

    await updateExtensionStorageStore('accounts', [...filteredAccounts, account]);
  };

  const addAccountWithName = async (accountInfo: AccountWithName) => {
    const { name, ...account } = accountInfo;

    const storedAccounts = await getExtensionLocalStorage('accounts');
    const accounts = storedAccounts ?? [];

    const filteredAccounts = accounts.filter((account) => account.id !== accountInfo.id);

    await updateExtensionStorageStore('accounts', [...filteredAccounts, account]);
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
    await removeInitCheckLegacyBalanceAccountId(id);

    if (encryptedRestoreString && !newAccounts.some((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === encryptedRestoreString)) {
      await removeMnemonicName(encryptedRestoreString);
    }

    await deleteKeysContainingString(id);
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
    await removeInitCheckLegacyBalanceAccountIds(targetAccountsIds);

    const removePromises = targetAccounts.map(({ id }) => deleteKeysContainingString(id));

    await Promise.all(removePromises);
  };

  const currentAccountApporvedOrigins = useMemo(
    () => approvedOrigins.filter((approvedOrigin) => approvedOrigin.accountId === selectedAccountId),
    [approvedOrigins, selectedAccountId],
  );

  const addApprovedOrigin = async (origin: string) => {
    const lastConnectedAt = new Date().getTime();

    const newApporvedOrigins = [...approvedOrigins, { origin, accountId: currentAccount?.id, lastConnectedAt }];
    await updateExtensionStorageStore('approvedOrigins', newApporvedOrigins);
  };

  const removeApprovedOrigin = async (origin: string) => {
    const newApprovedOrigins = approvedOrigins.filter(
      (approvedOrigin) => !(approvedOrigin.accountId === selectedAccountId && approvedOrigin.origin === origin),
    );

    emitToWeb({ event: 'accountsChanged', chainType: 'evm', data: { result: [] } }, [origin]);
    await updateExtensionStorageStore('approvedOrigins', newApprovedOrigins);
  };

  const removeAllApprovedOrigin = async () => {
    emitToWeb({ event: 'accountsChanged', chainType: 'evm', data: { result: [] } }, [origin]);

    await updateExtensionStorageStore('approvedOrigins', []);
    await updateExtensionStorageStore('approvedSuiPermissions', []);
  };

  const currentAccountApprovedSuiPermissions = useMemo(
    () => approvedSuiPermissions.filter((permission) => permission.accountId === currentAccount?.id),
    [approvedSuiPermissions, currentAccount?.id],
  );

  const addSuiPermissions = async (permissions: ApprovedSuiPermissionType[], origin: string) => {
    const lastConnectedAt = new Date().getTime();

    const newSuiPermissions = [
      ...approvedSuiPermissions.filter((permission) => permission.accountId !== currentAccount?.id),
      ...permissions.map((permission) => ({ id: uuidv4(), accountId: currentAccount?.id, permission, origin, lastConnectedAt })),
    ];

    await updateExtensionStorageStore('approvedSuiPermissions', newSuiPermissions);
  };

  const removeSuiPermissions = async (permissions: ApprovedSuiPermissionType[], origin: string) => {
    const newSuiPermissions = approvedSuiPermissions.filter(
      (permission) =>
        !(permission.accountId === currentAccount?.id && permission.origin === origin && permissions.some((item) => item === permission.permission)),
    );

    await updateExtensionStorageStore('approvedSuiPermissions', newSuiPermissions);
  };

  return {
    currentAccount: currentAccountWithName,
    currentAccountApporvedOrigins,
    currentAccountApprovedSuiPermissions,
    setCurrentAccount,
    addAccount,
    removeMnemonic,
    addAccountWithName,
    removeAccount,
    addApprovedOrigin,
    removeApprovedOrigin,
    removeAllApprovedOrigin,
    addSuiPermissions,
    removeSuiPermissions,
  };
}
