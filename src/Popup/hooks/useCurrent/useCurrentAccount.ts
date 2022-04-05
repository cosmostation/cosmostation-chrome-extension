import cloneDeep from 'lodash/cloneDeep';

import { CHAINS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { openTab } from '~/Popup/utils/chromeTabs';
import { emitToWeb } from '~/Popup/utils/message';
import type { Account } from '~/types/chromeStorage';

export function useCurrentAccount() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { selectedAccountId, accounts, accountName, allowedOrigins, additionalChains } = chromeStorage;

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
  };

  const setCurrentAccount = async (id: string) => {
    const isExist = !!chromeStorage.accounts.find((account) => account.id === id);

    await setChromeStorage('selectedAccountId', isExist ? id : chromeStorage.accounts[0].id);

    const origins = Array.from(new Set(allowedOrigins.map((item) => item.origin)));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    emitToWeb({ line: 'TENDERMINT', type: 'accountChanged' }, origins);
  };

  const addAccount = async (accountInfo: Account & { name: string }) => {
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
    currentAccount: { ...currentAccount, name: currentAccountName, allowedOrigins: currentAccountAllowedOrigins },
    setCurrentAccount,
    addAllowedOrigin,
    removeAllowedOrigin,
    addAccount,
    removeAccount,
  };
}
