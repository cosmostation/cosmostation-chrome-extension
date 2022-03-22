import { CHAINS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { Chain } from '~/types/chain';

export function useCurrentChain() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { additionalChains, allowedChainIds, selectedChainId } = chromeStorage;
  const additionalChainIds = additionalChains.map((item) => item.id);

  const allChains = [...CHAINS, ...additionalChains];

  const currentAccountSelectedChainId = [...allowedChainIds, ...additionalChainIds].includes(selectedChainId) ? selectedChainId : allowedChainIds[0];

  const currentChain = allChains.find((chain) => chain.id === currentAccountSelectedChainId)!;

  const setCurrentChain = async (chain: Chain) => {
    if (![...allowedChainIds, ...additionalChainIds].includes(chain.id)) {
      return;
    }

    await setChromeStorage('selectedChainId', chain.id);
  };

  return { currentChain, setCurrentChain };
}
