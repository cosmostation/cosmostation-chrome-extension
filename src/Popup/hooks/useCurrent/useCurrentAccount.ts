import cloneDeep from 'lodash/cloneDeep';
import { v4 as uuidv4 } from 'uuid';

import { APTOS } from '~/constants/chain/aptos/aptos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { SUI } from '~/constants/chain/sui/sui';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { openTab } from '~/Popup/utils/extensionTabs';
import { emitToWeb } from '~/Popup/utils/message';
import type { Account, AccountWithName, SuiPermissionType } from '~/types/extensionStorage';

import { useCurrentPassword } from './useCurrentPassword';

export function useCurrentAccount() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { currentPassword } = useCurrentPassword();

  const { selectedAccountId, accounts, accountName, allowedOrigins, suiPermissions } = extensionStorage;

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);

  const currentAccount = selectedAccount || accounts[0];

  const currentAccountName = accountName[currentAccount.id] ?? '';

  const currentAccountSuiPermissions = suiPermissions.filter((permission) => permission.accountId === currentAccount.id);

  const currentAccountAllowedOrigins = allowedOrigins
    .filter((allowedOrigin) => allowedOrigin.accountId === selectedAccountId)
    .map((allowedOrigin) => allowedOrigin.origin);

  const addAllowedOrigin = async (origin: string) => {
    const newAllowedOrigins = [...allowedOrigins, { origin, accountId: currentAccount.id }];
    await setExtensionStorage('allowedOrigins', newAllowedOrigins);
  };

  const removeAllowedOrigin = async (origin: string) => {
    const newAllowedOrigins = allowedOrigins.filter((allowedOrigin) => !(allowedOrigin.accountId === selectedAccountId && allowedOrigin.origin === origin));

    emitToWeb({ line: 'ETHEREUM', type: 'accountsChanged', message: { result: [] } }, [origin]);

    await setExtensionStorage('allowedOrigins', newAllowedOrigins);
  };

  const setCurrentAccount = async (id: string) => {
    const isExist = !!extensionStorage.accounts.find((account) => account.id === id);

    const newAccountId = isExist ? id : extensionStorage.accounts[0].id;

    await setExtensionStorage('selectedAccountId', newAccountId);

    const origins = Array.from(new Set(allowedOrigins.map((item) => item.origin)));

    emitToWeb({ line: 'COSMOS', type: 'accountChanged' }, origins);

    const ethereumKeyPair = getKeyPair(accounts.find((item) => item.id === newAccountId)!, ETHEREUM, currentPassword);
    const ethereumAddress = getAddress(ETHEREUM, ethereumKeyPair?.publicKey);

    const currentAccountOrigins = Array.from(new Set(allowedOrigins.filter((item) => item.accountId === newAccountId).map((item) => item.origin)));
    const currentAccountNotOrigins = Array.from(new Set(allowedOrigins.filter((item) => item.accountId !== newAccountId).map((item) => item.origin)));

    emitToWeb({ line: 'ETHEREUM', type: 'accountsChanged', message: { result: [ethereumAddress] } }, currentAccountOrigins);
    emitToWeb(
      { line: 'ETHEREUM', type: 'accountsChanged', message: { result: [] } },
      currentAccountNotOrigins.filter((item) => !currentAccountOrigins.includes(item)),
    );

    const aptosKeyPair = getKeyPair(accounts.find((item) => item.id === newAccountId)!, APTOS, currentPassword);
    const aptosAddress = getAddress(APTOS, aptosKeyPair?.publicKey);

    emitToWeb({ line: 'APTOS', type: 'accountChange', message: { result: aptosAddress } }, currentAccountOrigins);
    emitToWeb(
      { line: 'APTOS', type: 'accountChange', message: { result: '' } },
      currentAccountNotOrigins.filter((item) => !currentAccountOrigins.includes(item)),
    );

    const suiKeyPair = getKeyPair(accounts.find((item) => item.id === newAccountId)!, SUI, currentPassword);
    const suiAddress = getAddress(SUI, suiKeyPair?.publicKey);

    emitToWeb({ line: 'SUI', type: 'accountChange', message: { result: suiAddress } }, currentAccountOrigins);
    emitToWeb(
      { line: 'SUI', type: 'accountChange', message: { result: '' } },
      currentAccountNotOrigins.filter((item) => !currentAccountOrigins.includes(item)),
    );
  };

  const addAccount = async (accountInfo: AccountWithName) => {
    const { name, ...account } = accountInfo;
    await setExtensionStorage('accounts', [...accounts, account]);

    await setExtensionStorage('accountName', { ...accountName, [account.id]: name });
  };

  const removeAccount = async (account: Account) => {
    const newAccounts = accounts.filter((acc) => acc.id !== account.id);

    if (account.id === extensionStorage.selectedAccountId) {
      await setExtensionStorage('selectedAccountId', newAccounts?.[0]?.id ?? '');
    }

    await setExtensionStorage('accounts', newAccounts);

    const deepCopiedAccountName = cloneDeep(accountName);

    delete deepCopiedAccountName[account.id];

    await setExtensionStorage('accountName', deepCopiedAccountName);

    if (newAccounts.length === 0) {
      await openTab();
    }
  };

  const addSuiPermissions = async (permissions: SuiPermissionType[], origin: string) => {
    const newSuiPermissions = [
      ...suiPermissions.filter((permission) => permission.accountId !== currentAccount.id),
      ...permissions.map((permission) => ({ id: uuidv4(), accountId: currentAccount.id, permission, origin })),
    ];

    await setExtensionStorage('suiPermissions', newSuiPermissions);
  };

  const removeSuiPermissions = async (permissions: SuiPermissionType[], origin: string) => {
    const newSuiPermissions = suiPermissions.filter(
      (permission) =>
        !(permission.accountId === currentAccount.id && permission.origin === origin && permissions.some((item) => item === permission.permission)),
    );
    await setExtensionStorage('suiPermissions', newSuiPermissions);
  };
  return {
    currentAccount: { ...currentAccount, name: currentAccountName },
    currentAccountAllowedOrigins,
    currentAccountSuiPermissions,
    setCurrentAccount,
    addAllowedOrigin,
    removeAllowedOrigin,
    addAccount,
    removeAccount,
    addSuiPermissions,
    removeSuiPermissions,
  };
}
