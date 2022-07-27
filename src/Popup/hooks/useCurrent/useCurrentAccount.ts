import cloneDeep from 'lodash/cloneDeep';

import { CHAINS } from '~/constants/chain';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { openTab } from '~/Popup/utils/chromeTabs';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import { emitToWeb } from '~/Popup/utils/message';
import type { Account, AccountWithName } from '~/types/chromeStorage';

import { useCurrentPassword } from './useCurrentPassword';

export function useCurrentAccount() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();
  const { currentPassword } = useCurrentPassword();

  const { selectedAccountId, accounts, accountName, allowedOrigins, additionalChains, autoSigns } = chromeStorage;

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);

  const currentAccount = selectedAccount || accounts[0];

  const currentAccountName = accountName[currentAccount.id] ?? '';

  const currentAccountAllowedOrigins = allowedOrigins
    .filter((allowedOrigin) => allowedOrigin.accountId === selectedAccountId)
    .map((allowedOrigin) => allowedOrigin.origin);

  const addAllowedOrigin = async (origin: string) => {
    const newAllowedOrigins = [...allowedOrigins, { origin, accountId: currentAccount.id }];
    await setChromeStorage('allowedOrigins', newAllowedOrigins);
  };

  const removeAllowedOrigin = async (origin: string) => {
    const newAllowedOrigins = allowedOrigins.filter((allowedOrigin) => !(allowedOrigin.accountId === selectedAccountId && allowedOrigin.origin === origin));
    await setChromeStorage('allowedOrigins', newAllowedOrigins);

    const newAutoSigns = autoSigns.filter((autoSign) => !(autoSign.accountId === selectedAccountId && autoSign.origin === origin));
    await setChromeStorage('autoSigns', newAutoSigns);
  };

  const setCurrentAccount = async (id: string) => {
    const isExist = !!chromeStorage.accounts.find((account) => account.id === id);

    const newAccountId = isExist ? id : chromeStorage.accounts[0].id;

    await setChromeStorage('selectedAccountId', newAccountId);

    const origins = Array.from(new Set(allowedOrigins.map((item) => item.origin)));

    emitToWeb({ line: 'COSMOS', type: 'accountChanged' }, origins);

    const keyPair = getKeyPair(accounts.find((item) => item.id === newAccountId)!, ETHEREUM, currentPassword);
    const address = getAddress(ETHEREUM, keyPair?.publicKey);

    const currentAccountOrigins = Array.from(new Set(allowedOrigins.filter((item) => item.accountId === newAccountId).map((item) => item.origin)));
    const currentAccountNotOrigins = Array.from(new Set(allowedOrigins.filter((item) => item.accountId !== newAccountId).map((item) => item.origin)));

    emitToWeb({ line: 'ETHEREUM', type: 'accountsChanged', message: { result: [address] } }, currentAccountOrigins);
    emitToWeb(
      { line: 'ETHEREUM', type: 'accountsChanged', message: { result: [] } },
      currentAccountNotOrigins.filter((item) => !currentAccountOrigins.includes(item)),
    );
  };

  const addAccount = async (accountInfo: AccountWithName) => {
    const { name, ...account } = accountInfo;
    await setChromeStorage('accounts', [...accounts, account]);

    await setChromeStorage('accountName', { ...accountName, [account.id]: name });
  };

  const removeAccount = async (account: Account) => {
    const newAccounts = accounts.filter((acc) => acc.id !== account.id);

    if (account.id === chromeStorage.selectedAccountId) {
      await setChromeStorage('selectedAccountId', newAccounts?.[0]?.id ?? '');
    }

    await setChromeStorage('accounts', newAccounts);

    const deepCopiedAccountName = cloneDeep(accountName);

    delete deepCopiedAccountName[account.id];

    await setChromeStorage('accountName', deepCopiedAccountName);

    [...CHAINS, ...additionalChains].forEach((item) => {
      const key = `${account.id}${item.id}`;

      localStorage.removeItem(key);
    });

    if (newAccounts.length === 0) {
      await openTab();
    }
  };

  return {
    currentAccount: { ...currentAccount, name: currentAccountName },
    currentAccountAllowedOrigins,
    setCurrentAccount,
    addAllowedOrigin,
    removeAllowedOrigin,
    addAccount,
    removeAccount,
  };
}
