import { useMemo } from 'react';

import type { SuiChain } from '@/types/chain';
import { emitToWeb } from '@/utils/message';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useChainList } from '../useChainList';

export function useCurrentSuiNetwork() {
  const { chainList } = useChainList();
  const { chosenSuiNetworkId, approvedOrigins, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const allSuiChains = useMemo(() => [...(chainList.suiChains || [])], [chainList.suiChains]);

  const currentAccountSelectedSuiNetworkId = useMemo(() => {
    const selectedEvmChain = allSuiChains.find((network) => isMatchingUniqueChainId(network, chosenSuiNetworkId)) || allSuiChains[0];

    return selectedEvmChain ? getUniqueChainId(selectedEvmChain) : '';
  }, [allSuiChains, chosenSuiNetworkId]);

  const currentSuiNetwork = useMemo(
    () => allSuiChains.find((network) => isMatchingUniqueChainId(network, currentAccountSelectedSuiNetworkId)),
    [allSuiChains, currentAccountSelectedSuiNetworkId],
  );

  const setCurrentSuiNetwork = async (network: SuiChain) => {
    const newSelectedSuiNetworkId = getUniqueChainId(network);

    await updateExtensionStorageStore('chosenSuiNetworkId', newSelectedSuiNetworkId);

    const origins = Array.from(new Set(approvedOrigins.map((item) => item.origin)));

    const networkName = network.isTestnet ? 'testnet' : network.isDevnet ? 'devnet' : 'mainnet';

    emitToWeb({ event: 'chainChanged', chainType: 'sui', data: { result: networkName } }, origins);
  };

  return {
    ethereumNetworks: allSuiChains,
    currentSuiNetwork,
    setCurrentSuiNetwork,
  };
}
