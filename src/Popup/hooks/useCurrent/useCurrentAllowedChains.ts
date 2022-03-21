import { CHAINS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';

export function useCurrentAllowedChains() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const { allowedChainIds } = chromeStorage;

  const allChains = [...CHAINS];

  const currentAllowedChains = allChains.filter((chain) => allowedChainIds.includes(chain.id));

  const addAllowedChainId = async (chainId: string) => {
    if (allowedChainIds.find((allowedChainId) => allowedChainId === chainId)) {
      return;
    }

    await setChromeStorage('allowedChainIds', [...allowedChainIds, chainId]);
  };

  const removeAllowedChainId = async (chainId: string) => {
    if (!allowedChainIds.find((allowedChainId) => allowedChainId === chainId)) {
      return;
    }

    const newAllowedChainIds = allowedChainIds.slice();

    for (let i = 0; i < newAllowedChainIds.filter((newAllowedChainId) => newAllowedChainId === chainId).length; i += 1) {
      newAllowedChainIds.splice(
        newAllowedChainIds.findIndex((newAllowedChainId) => newAllowedChainId === chainId),
        1,
      );
    }

    await setChromeStorage('allowedChainIds', newAllowedChainIds);
  };

  return { currentAllowedChains, addAllowedChainId, removeAllowedChainId };
}
