import { useMemo } from 'react';

import { CHAINS } from '~/constants/chain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { Chain } from '~/types/chain';

export function useCurrentAllowedChains() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { allowedChainIds } = extensionStorage;

  const currentAllowedChains = useMemo(() => {
    const allChains = [...CHAINS];

    return allChains.filter((chain) => allowedChainIds.includes(chain.id));
  }, [allowedChainIds]);

  const addAllowedChainId = async (chain: Chain) => {
    if (allowedChainIds.find((allowedChainId) => allowedChainId === chain.id)) {
      return;
    }

    await setExtensionStorage('allowedChainIds', [...allowedChainIds, chain.id]);
  };

  const removeAllowedChainId = async (chain: Chain) => {
    if (!allowedChainIds.find((allowedChainId) => allowedChainId === chain.id)) {
      return;
    }

    const newAllowedChainIds = allowedChainIds.filter((allowedChainId) => allowedChainId !== chain.id);

    await setExtensionStorage('allowedChainIds', newAllowedChainIds);
  };

  return { currentAllowedChains, addAllowedChainId, removeAllowedChainId };
}
