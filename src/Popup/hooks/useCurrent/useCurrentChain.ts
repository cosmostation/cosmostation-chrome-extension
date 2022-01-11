import { CHAINS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import type { Chain } from '~/types/chain';
import type { Account } from '~/types/chromeStorage';

export function useCurrentChain() {
  const { currentAccount } = useCurrentAccount();
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { accounts, additionalChains } = chromeStorage;

  const { allowedChains } = currentAccount;

  console.log(allowedChains);
  console.log('currentAccount.selectedChain', currentAccount.selectedChain);

  const allChains = [...CHAINS, ...additionalChains];

  const currentChain = allowedChains.includes(currentAccount.selectedChain)
    ? allChains.find((chain) => chain.id === currentAccount.selectedChain)!
    : allChains.find((chain) => chain.id === allowedChains[0])!;

  console.log(currentChain);

  const setCurrentChain = async (chain: Chain) => {
    if (!allowedChains.includes(chain.id)) {
      return;
    }

    const newAccount: Account = { ...currentAccount, selectedChain: chain.id };

    const currentAccountIndex = accounts.findIndex((account) => account.id === currentAccount.id);

    if (currentAccountIndex > -1) {
      accounts.splice(
        accounts.findIndex((account) => account.id === currentAccount.id),
        1,
        newAccount,
      );

      await setChromeStorage('accounts', accounts);
    }
  };

  return { currentChain, setCurrentChain };
}
