import { useMemo } from 'react';

import type { IotaChain } from '@/types/chain';
import { emitToWeb } from '@/utils/message';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useChainList } from '../useChainList';

export function useCurrentIotaNetwork() {
  const { chainList } = useChainList();
  const { chosenIotaNetworkId, approvedOrigins, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const allIotaChains = useMemo(() => [...(chainList?.iotaChains || [])], [chainList?.iotaChains]);

  const currentAccountSelectedIotaNetworkId = useMemo(() => {
    const selectedIotaChain = allIotaChains.find((network) => isMatchingUniqueChainId(network, chosenIotaNetworkId)) || allIotaChains[0];

    return selectedIotaChain ? getUniqueChainId(selectedIotaChain) : '';
  }, [allIotaChains, chosenIotaNetworkId]);

  const currentIotaNetwork = useMemo(
    () => allIotaChains.find((network) => isMatchingUniqueChainId(network, currentAccountSelectedIotaNetworkId)),
    [allIotaChains, currentAccountSelectedIotaNetworkId],
  );

  const setCurrentIotaNetwork = async (network: IotaChain) => {
    const newSelectedIotaNetworkId = getUniqueChainId(network);

    await updateExtensionStorageStore('chosenIotaNetworkId', newSelectedIotaNetworkId);

    const origins = Array.from(new Set(approvedOrigins.map((item) => item.origin)));

    const networkName = network.isTestnet ? 'testnet' : network.isDevnet ? 'devnet' : 'mainnet';

    emitToWeb({ event: 'chainChanged', chainType: 'iota', data: { result: networkName } }, origins);
  };

  return {
    iotaNetworks: allIotaChains,
    currentIotaNetwork,
    setCurrentIotaNetwork,
  };
}
