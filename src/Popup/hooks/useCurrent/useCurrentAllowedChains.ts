import { CHAINS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { Chain } from '~/types/chain';

export function useCurrentAllowedChains() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { allowedChainIds } = chromeStorage;

  const allChains = [...CHAINS];

  const currentAllowedChains = allChains.filter((chain) => allowedChainIds.includes(chain.id));

  const addAllowedChainId = async (chain: Chain) => {
    if (allowedChainIds.find((allowedChainId) => allowedChainId === chain.id)) {
      return;
    }

    await setChromeStorage('allowedChainIds', [...allowedChainIds, chain.id]);
  };

  const removeAllowedChainId = async (chain: Chain) => {
    if (!allowedChainIds.find((allowedChainId) => allowedChainId === chain.id)) {
      return;
    }

    const newAllowedChainIds = allowedChainIds.filter((allowedChainId) => allowedChainId !== chain.id);

    await setChromeStorage('allowedChainIds', newAllowedChainIds);
  };

  return { currentAllowedChains, addAllowedChainId, removeAllowedChainId };
}
