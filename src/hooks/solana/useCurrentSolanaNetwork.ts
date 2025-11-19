import { useMemo } from 'react';

import type { SolanaChain } from '@/types/chain';
import { emitToWeb } from '@/utils/message';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useChainList } from '../useChainList';

export function useCurrentSolanaNetwork() {
  const { chainList } = useChainList();
  const { chosenSolanaNetworkId, approvedOrigins, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const allSolanaChains = useMemo(() => [...(chainList?.solanaChains || [])], [chainList?.solanaChains]);

  const currentAccountSelectedSolanaChainId = useMemo(() => {
    const selectedSolanaChain = allSolanaChains.find((network) => isMatchingUniqueChainId(network, chosenSolanaNetworkId)) || allSolanaChains[0];

    return selectedSolanaChain ? getUniqueChainId(selectedSolanaChain) : '';
  }, [allSolanaChains, chosenSolanaNetworkId]);

  const currentSolanaNetwork = useMemo(
    () => allSolanaChains.find((network) => isMatchingUniqueChainId(network, currentAccountSelectedSolanaChainId)),
    [allSolanaChains, currentAccountSelectedSolanaChainId],
  );

  const setCurrentSolanaNetwork = async (network: SolanaChain) => {
    const newSelectedSolanaNetworkId = getUniqueChainId(network);

    await updateExtensionStorageStore('chosenSolanaNetworkId', newSelectedSolanaNetworkId);

    const origins = Array.from(new Set(approvedOrigins.map((item) => item.origin)));

    const networkName = network.isTestnet ? 'testnet' : 'mainnet';

    emitToWeb({ event: 'networkChange', chainType: 'solana', data: { result: networkName } }, origins);
  };

  return {
    solanaNetworks: allSolanaChains,
    currentSolanaNetwork,
    setCurrentSolanaNetwork,
  };
}
