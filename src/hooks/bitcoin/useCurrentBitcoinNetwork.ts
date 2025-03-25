import { useMemo } from 'react';
import { produce } from 'immer';

import type { BitcoinChain } from '@/types/chain';
import { getUniqueChainId, isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useChainList } from '../useChainList';
import { useCurrentPreferAccountTypes } from '../useCurrentPreferAccountTypes';

export function useCurrentBitcoinNetwork() {
  const { chainList } = useChainList();

  const { chosenBitcoinNetworkId, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { currentPreferAccountType } = useCurrentPreferAccountTypes();

  const allNetworks = useMemo(() => [...(chainList?.bitcoinChains || [])], [chainList?.bitcoinChains]);
  const selectedBitcoinNetwork = useMemo(
    () => allNetworks.find((network) => isMatchingUniqueChainId(network, chosenBitcoinNetworkId)),
    [allNetworks, chosenBitcoinNetworkId],
  );

  const currentAccountSelectedBitcoinNetworkId = useMemo(
    () => (selectedBitcoinNetwork ? getUniqueChainId(selectedBitcoinNetwork) : allNetworks[0] ? getUniqueChainId(allNetworks[0]) : undefined),
    [allNetworks, selectedBitcoinNetwork],
  );

  const currentBitcoinNetwork = useMemo(() => {
    const network = allNetworks.find((network) => isMatchingUniqueChainId(network, currentAccountSelectedBitcoinNetworkId));

    if (!network) {
      return allNetworks[0];
    }

    const inAppSelectedPubkeyStyle = currentPreferAccountType?.[network.id].pubkeyStyle;

    const response = produce(network, (draft) => {
      draft.accountTypes = draft.accountTypes.filter((item) => item.pubkeyStyle === inAppSelectedPubkeyStyle);
    });

    return response;
  }, [allNetworks, currentAccountSelectedBitcoinNetworkId, currentPreferAccountType]);

  const setCurrentBitcoinNetwork = async (chain: BitcoinChain) => {
    const newSelectedEthereumNetworkId = getUniqueChainId(chain);

    await updateExtensionStorageStore('chosenBitcoinNetworkId', newSelectedEthereumNetworkId);
  };

  return {
    bitcoinNetworks: allNetworks,
    currentBitcoinNetwork,
    setCurrentBitcoinNetwork,
  };
}
