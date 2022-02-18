import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';

export function useCurrentAccount() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { selectedAccountId, accounts, accountName } = chromeStorage;

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);

  const currentAccount = selectedAccount || accounts[0];

  const name = accountName[currentAccount.id] ?? '';
  const allowedChains = chromeStorage.allowedChains.filter((chain) => chain.accountId === currentAccount.id).map((chain) => chain.chainId);

  const setCurrentAccount = async (id: string) => {
    const isExist = !!chromeStorage.accounts.find((account) => account.id === id);

    await setChromeStorage('selectedAccountId', isExist ? id : chromeStorage.accounts[0].id);
  };

  return { currentAccount: { ...currentAccount, name, allowedChains }, setCurrentAccount };
}
