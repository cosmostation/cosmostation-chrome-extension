import { CHAINS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import type { Chain } from '~/types/chain';
import type { SelectedChainId } from '~/types/chromeStorage';

export function useCurrentChain() {
  const { currentAccount } = useCurrentAccount();
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { accounts, additionalChains, allowedChains, selectedChainId } = chromeStorage;

  console.log(allowedChains);

  const allChains = [...CHAINS, ...additionalChains];

  const currentAccountAllowedChains = allowedChains
    .filter((allowedChain) => allowedChain.accountId === currentAccount.id)
    .map((allowedChain) => allowedChain.chainId);

  const currentAccountSelectedChainId = selectedChainId[currentAccount.id] ?? currentAccountAllowedChains[0];

  const currentChain = allChains.find((chain) => chain.id === currentAccountSelectedChainId)!;

  console.log(currentChain);

  const setCurrentChain = async (chain: Chain) => {
    if (!currentAccountAllowedChains.includes(chain.id)) {
      return;
    }

    const newSelecteChainId: SelectedChainId = { ...selectedChainId, [currentAccount.id]: chain.id };

    await setChromeStorage('selectedChainId', newSelecteChainId);
  };

  return { currentChain, setCurrentChain };
}
