import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';

export function useCurrentAccount() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const selectedAccount = chromeStorage.accounts.find((account) => account.name === chromeStorage.selectedAccountName);

  const currentAccount = selectedAccount || chromeStorage.accounts[0];

  const setCurrentAccount = async (name: string) => {
    const isExist = !!chromeStorage.accounts.find((account) => account.name === name);

    await setChromeStorage('selectedAccountName', isExist ? name : chromeStorage.accounts[0].name);
  };

  return { currentAccount, setCurrentAccount };
}
