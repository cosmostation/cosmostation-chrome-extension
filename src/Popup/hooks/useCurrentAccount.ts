import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';

export function useCurrentAccount() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const selectedAccount = chromeStorage.accounts.find((account) => account.id === chromeStorage.selectedAccountId);

  const currentAccount = selectedAccount || chromeStorage.accounts[0];

  const setCurrentAccount = async (id: string) => {
    const isExist = !!chromeStorage.accounts.find((account) => account.id === id);

    await setChromeStorage('selectedAccountId', isExist ? id : chromeStorage.accounts[0].id);
  };

  return { currentAccount, setCurrentAccount };
}
