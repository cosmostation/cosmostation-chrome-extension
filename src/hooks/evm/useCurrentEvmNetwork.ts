import { useMemo } from 'react';

import type { EvmChain } from '@/types/chain';
import { emitToWeb } from '@/utils/message';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useChainList } from '../useChainList';

export function useCurrentEVMNetwork() {
  const { chainList } = useChainList();
  const { chosenEthereumNetworkId, addedCustomChainList, approvedOrigins, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const allEVMChains = useMemo(() => [...(chainList?.allEVMChains || [])], [chainList?.allEVMChains]);
  const additionalEthereumNetworks = useMemo(() => addedCustomChainList.filter((chain) => chain.chainType === 'evm'), [addedCustomChainList]);

  const currentAccountSelectedEthereumNetworkId = useMemo(() => {
    const selectedEvmChain = allEVMChains.find((network) => isMatchingUniqueChainId(network, chosenEthereumNetworkId)) || allEVMChains[0];

    return selectedEvmChain ? getUniqueChainId(selectedEvmChain) : '';
  }, [allEVMChains, chosenEthereumNetworkId]);

  const currentEVMNetwork = useMemo(
    () => allEVMChains.find((network) => isMatchingUniqueChainId(network, currentAccountSelectedEthereumNetworkId)),
    [allEVMChains, currentAccountSelectedEthereumNetworkId],
  );

  const setCurrentEVMNetwork = async (network: EvmChain) => {
    const newSelectedEthereumNetworkId = getUniqueChainId(network);

    await updateExtensionStorageStore('chosenEthereumNetworkId', newSelectedEthereumNetworkId);

    const origins = Array.from(new Set(approvedOrigins.map((item) => item.origin)));

    emitToWeb({ event: 'chainChanged', chainType: 'evm', data: { result: network.chainId } }, origins);
  };

  return {
    ethereumNetworks: allEVMChains,
    additionalEthereumNetworks,
    currentEVMNetwork,
    setCurrentEVMNetwork,
  };
}
