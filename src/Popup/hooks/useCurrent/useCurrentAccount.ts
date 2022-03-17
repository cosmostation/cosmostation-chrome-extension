import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';

export function useCurrentAccount() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { selectedAccountId, accounts, accountName, allowedOrigins } = chromeStorage;

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);

  const currentAccount = selectedAccount || accounts[0];

  const name = accountName[currentAccount.id] ?? '';

  const setCurrentAccount = async (id: string) => {
    const isExist = !!chromeStorage.accounts.find((account) => account.id === id);

    await setChromeStorage('selectedAccountId', isExist ? id : chromeStorage.accounts[0].id);
  };

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

  return {
    currentAccount: { ...currentAccount, name, allowedOrigins: currentAccountAllowedOrigins },
    setCurrentAccount,
    addAllowedOrigin,
    removeAllowedOrigin,
  };
}
