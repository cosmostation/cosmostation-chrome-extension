import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { Account, AccountWithName } from '@/types/account';
import type { ApprovedIotaPermissionType, ApprovedSuiPermissionType } from '@/types/extension';
import { emitChangedAddressEvent } from '@/utils/event';
import { emitToWeb } from '@/utils/message';
import { removeMnemonicName } from '@/utils/mnemonicNames';
import { parseUniqueChainId } from '@/utils/queryParamGenerator';
import { deleteKeysContainingString, getExtensionLocalStorage } from '@/utils/storage';
import { removeAccountName, removeAccountNames } from '@/utils/zustand/accountNames';
import { removeAccountFromNotBackedupList, removeAccountFromNotBackedupLists } from '@/utils/zustand/backupAccount';
import { removeInitAccountId, removeInitAccountIds } from '@/utils/zustand/initAccountIds';
import { removeInitCheckLegacyBalanceAccountId, removeInitCheckLegacyBalanceAccountIds } from '@/utils/zustand/initCheckLegacyBalanceAccountId';
import { removePreferAccountType, removePreferAccountTypes } from '@/utils/zustand/preferAccountType';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useSyncChainFilterIdWithAccountType } from './useSyncChainFilterIdWithAccountType';

export function useCurrentAccount() {
  const {
    userAccounts,
    accountNamesById,
    currentAccountId,
    approvedOrigins,
    approvedSuiPermissions,
    approvedIotaPermissions,
    preferAccountType,
    selectedChainFilterId,
    updateExtensionStorageStore,
  } = useExtensionStorageStore((state) => state);
  const { syncChainFilterIdWithAccountType } = useSyncChainFilterIdWithAccountType();

  const selectedAccount = useMemo(() => userAccounts.find((account) => account.id === currentAccountId), [currentAccountId, userAccounts]);

  const currentAccount = useMemo(() => selectedAccount || userAccounts[0], [selectedAccount, userAccounts]);

  const currentAccountName = useMemo(() => accountNamesById[currentAccount?.id] ?? '', [accountNamesById, currentAccount?.id]);
  const currentAccountWithName = useMemo(() => ({ ...currentAccount, name: currentAccountName }), [currentAccount, currentAccountName]);

  const setCurrentAccount = async (id: string) => {
    if (currentAccountId === id) return;

    const storedAccounts = await getExtensionLocalStorage('userAccounts');
    const accounts = storedAccounts ?? [];

    const isExist = !!accounts.find((account) => account.id === id);

    const newAccountId = isExist ? id : accounts[0].id;

    await updateExtensionStorageStore('currentAccountId', newAccountId);

    const newAccountPreferAccountType = preferAccountType[newAccountId];

    if (newAccountPreferAccountType && selectedChainFilterId) {
      const currentParsedChainFilterId = parseUniqueChainId(selectedChainFilterId);
      if (currentParsedChainFilterId) {
        const newAccountChainAccountType = newAccountPreferAccountType[currentParsedChainFilterId.id];
        if (newAccountChainAccountType) {
          await syncChainFilterIdWithAccountType(newAccountChainAccountType);
        }
      }
    }

    await emitChangedAddressEvent(newAccountId);
  };

  const addAccount = async (account: Account) => {
    const storedAccounts = await getExtensionLocalStorage('userAccounts');
    const accounts = storedAccounts ?? [];

    const filteredAccounts = accounts.filter((item) => item.id !== account.id);

    await updateExtensionStorageStore('userAccounts', [...filteredAccounts, account]);
  };

  const addAccountWithName = async (accountInfo: AccountWithName) => {
    const { name, ...account } = accountInfo;

    const storedAccounts = await getExtensionLocalStorage('userAccounts');
    const accounts = storedAccounts ?? [];

    const filteredAccounts = accounts.filter((account) => account.id !== accountInfo.id);

    await updateExtensionStorageStore('userAccounts', [...filteredAccounts, account]);
    await updateExtensionStorageStore('accountNamesById', { ...accountNamesById, [account.id]: name });
    await updateExtensionStorageStore('selectedChainFilterId', null);
  };

  const removeAccount = async (id: string) => {
    const encryptedRestoreString = userAccounts.find((acc) => acc.id === id)?.encryptedRestoreString;
    const newAccounts = userAccounts.filter((acc) => acc.id !== id);

    if (id === currentAccountId) {
      await updateExtensionStorageStore('currentAccountId', newAccounts?.[0]?.id ?? '');
    }

    await updateExtensionStorageStore('userAccounts', newAccounts);

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
    const targetAccounts = userAccounts.filter((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === mnemonicId);
    const targetAccountsIds = userAccounts
      .filter((account) => account.type === 'MNEMONIC' && account.encryptedRestoreString === mnemonicId)
      .map(({ id }) => id);
    const updatedAccounts = userAccounts.filter((account) => !targetAccounts.map(({ id }) => id).includes(account.id));

    if (!updatedAccounts.map(({ id }) => id).includes(currentAccountId)) {
      await updateExtensionStorageStore('currentAccountId', updatedAccounts?.[0]?.id ?? '');
    }

    await updateExtensionStorageStore('userAccounts', updatedAccounts);

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
    () => approvedOrigins.filter((approvedOrigin) => approvedOrigin.accountId === currentAccountId),
    [approvedOrigins, currentAccountId],
  );

  const addApprovedOrigin = async (origin: string) => {
    const lastConnectedAt = new Date().getTime();

    const newApporvedOrigins = [...approvedOrigins, { origin, accountId: currentAccount?.id, lastConnectedAt, txCount: 0 }];
    await updateExtensionStorageStore('approvedOrigins', newApporvedOrigins);
  };

  const refreshOriginConnectionTime = async (origin: string) => {
    const lastConnectedAt = new Date().getTime();

    const newApprovedOrigins = approvedOrigins.map((approvedOrigin) =>
      approvedOrigin.accountId === currentAccountId && approvedOrigin.origin === origin ? { ...approvedOrigin, lastConnectedAt } : approvedOrigin,
    );

    await updateExtensionStorageStore('approvedOrigins', newApprovedOrigins);
  };

  const incrementTxCountForOrigin = async (origin: string) => {
    const newApprovedOrigins = approvedOrigins.map((approvedOrigin) =>
      approvedOrigin.accountId === currentAccountId && approvedOrigin.origin === origin
        ? { ...approvedOrigin, txCount: approvedOrigin.txCount + 1 }
        : approvedOrigin,
    );

    await updateExtensionStorageStore('approvedOrigins', newApprovedOrigins);
  };

  const removeApprovedOrigin = async (origin: string) => {
    const newApprovedOrigins = approvedOrigins.filter((approvedOrigin) => !(approvedOrigin.accountId === currentAccountId && approvedOrigin.origin === origin));

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

  const currentAccountApprovedIotaPermissions = useMemo(
    () => approvedIotaPermissions.filter((permission) => permission.accountId === currentAccount?.id),
    [approvedIotaPermissions, currentAccount?.id],
  );

  const addIotaPermissions = async (permissions: ApprovedIotaPermissionType[], origin: string) => {
    const lastConnectedAt = new Date().getTime();

    const newIotaPermissions = [
      ...approvedIotaPermissions.filter((permission) => permission.accountId !== currentAccount?.id),
      ...permissions.map((permission) => ({ id: uuidv4(), accountId: currentAccount?.id, permission, origin, lastConnectedAt })),
    ];

    await updateExtensionStorageStore('approvedIotaPermissions', newIotaPermissions);
  };

  const removeIotaPermissions = async (permissions: ApprovedIotaPermissionType[], origin: string) => {
    const newIotaPermissions = approvedIotaPermissions.filter(
      (permission) =>
        !(permission.accountId === currentAccount?.id && permission.origin === origin && permissions.some((item) => item === permission.permission)),
    );

    await updateExtensionStorageStore('approvedIotaPermissions', newIotaPermissions);
  };

  return {
    currentAccount: currentAccountWithName,
    currentAccountApporvedOrigins,
    currentAccountApprovedSuiPermissions,
    currentAccountApprovedIotaPermissions,
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
    addIotaPermissions,
    removeIotaPermissions,
    refreshOriginConnectionTime,
    incrementTxCountForOrigin,
  };
}
