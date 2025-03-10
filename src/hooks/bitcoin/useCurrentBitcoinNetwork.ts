import { useMemo } from 'react';
import { produce } from 'immer';

import type { BitcoinChain } from '@/types/chain';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useChainList } from '../useChainList';
import { useCurrentPreferAccountTypes } from '../useCurrentPreferAccountTypes';

export function useCurrentBitcoinNetwork() {
  const { chainList } = useChainList();

  const { chosenBitcoinNetworkId, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { currentPreferAccountType } = useCurrentPreferAccountTypes();

  const allNetworks = useMemo(() => [...(chainList?.bitcoinChains || [])], [chainList?.bitcoinChains]);

  const currentAccountSelectedBitcoinNetworkId = allNetworks.find((network) => network.id === chosenBitcoinNetworkId)?.id ?? allNetworks[0]?.id;

  const currentBitcoinNetwork = useMemo(() => {
    const network = allNetworks.find((network) => network.id === currentAccountSelectedBitcoinNetworkId);

    if (!network) {
      return allNetworks[0];
    }

    const inAppSelectedPubkeyStyle = currentPreferAccountType[network.id].pubkeyStyle;

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
