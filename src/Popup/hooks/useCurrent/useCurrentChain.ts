import { useMemo } from 'react';

import { CHAINS } from '~/constants/chain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import type { Chain } from '~/types/chain';

import { useCurrentAllowedChains } from './useCurrentAllowedChains';

export function useCurrentChain() {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const { currentAllowedChains } = useCurrentAllowedChains();

  const { additionalChains, selectedChainId } = extensionStorage;
  const additionalChainIds = useMemo(() => additionalChains.map((item) => item.id), [additionalChains]);

  const allowedChainIds = useMemo(() => currentAllowedChains.map((item) => item.id), [currentAllowedChains]);

  const allChains = useMemo(() => [...CHAINS, ...additionalChains], [additionalChains]);

  const currentAccountSelectedChainId = useMemo(
    () => ([...allowedChainIds, ...additionalChainIds].includes(selectedChainId) ? selectedChainId : allowedChainIds[0]),
    [additionalChainIds, allowedChainIds, selectedChainId],
  );

  const currentChain = useMemo(() => allChains.find((chain) => chain.id === currentAccountSelectedChainId)!, [allChains, currentAccountSelectedChainId]);

  const setCurrentChain = async (chain: Chain) => {
    if (![...allowedChainIds, ...additionalChainIds].includes(chain.id)) {
      return;
    }

    await setExtensionStorage('selectedChainId', chain.id);
  };

  return { currentChain, setCurrentChain };
}
