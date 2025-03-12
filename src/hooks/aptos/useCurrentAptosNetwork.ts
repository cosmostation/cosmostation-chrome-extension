import { useMemo } from 'react';

import type { AptosChain } from '@/types/chain';
import { emitToWeb } from '@/utils/message';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useChainList } from '../useChainList';

export function useCurrentAptosNetwork() {
  const { chainList } = useChainList();
  const { chosenAptosNetworkId, approvedOrigins, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const allAptosChains = useMemo(() => [...(chainList?.aptosChains || [])], [chainList?.aptosChains]);

  const currentAccountSelectedAptosChainId = useMemo(() => {
    const selectedAptosChain = allAptosChains.find((network) => isMatchingUniqueChainId(network, chosenAptosNetworkId)) || allAptosChains[0];

    return selectedAptosChain ? getUniqueChainId(selectedAptosChain) : '';
  }, [allAptosChains, chosenAptosNetworkId]);

  const currentAptosNetwork = useMemo(
    () => allAptosChains.find((network) => isMatchingUniqueChainId(network, currentAccountSelectedAptosChainId)),
    [allAptosChains, currentAccountSelectedAptosChainId],
  );

  const setCurrentAptosNetwork = async (network: AptosChain) => {
    const newSelectedAptosNetworkId = getUniqueChainId(network);

    await updateExtensionStorageStore('chosenAptosNetworkId', newSelectedAptosNetworkId);

    const origins = Array.from(new Set(approvedOrigins.map((item) => item.origin)));

    const networkName = network.isTestnet ? 'testnet' : network.isDevnet ? 'devnet' : 'mainnet';

    emitToWeb({ event: 'networkChange', chainType: 'aptos', data: { result: networkName } }, origins);
  };

  return {
    aptosNetworks: allAptosChains,
    currentAptosNetwork,
    setCurrentAptosNetwork,
  };
}
