import { useMemo } from 'react';

import type { GnoChain } from '@/types/chain';
import { emitToWeb } from '@/utils/message';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useChainList } from '../useChainList';

export function useCurrentGnoNetwork() {
  const { chainList } = useChainList();
  const { chosenGnoNetworkId, approvedOrigins, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const allGnoChains = useMemo(() => [...(chainList?.gnoChains || [])], [chainList?.gnoChains]);

  const currentAccountSelectedGnoNetworkId = useMemo(() => {
    const selectedGnoChain = allGnoChains.find((network) => isMatchingUniqueChainId(network, chosenGnoNetworkId)) || allGnoChains[0];

    return selectedGnoChain ? getUniqueChainId(selectedGnoChain) : '';
  }, [allGnoChains, chosenGnoNetworkId]);

  const currentGnoNetwork = useMemo(
    () => allGnoChains.find((network) => isMatchingUniqueChainId(network, currentAccountSelectedGnoNetworkId)),
    [allGnoChains, currentAccountSelectedGnoNetworkId],
  );

  const setCurrentGnoNetwork = async (network: GnoChain) => {
    const newSelectedGnoNetworkId = getUniqueChainId(network);

    await updateExtensionStorageStore('chosenGnoNetworkId', newSelectedGnoNetworkId);

    const origins = Array.from(new Set(approvedOrigins.map((item) => item.origin)));

    emitToWeb({ event: 'changedNetwork', chainType: 'gno', data: { result: network.chainId } }, origins);
  };

  return {
    gnoNetworks: allGnoChains,
    currentGnoNetwork,
    setCurrentGnoNetwork,
  };
}
