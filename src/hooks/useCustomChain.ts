import { customChainAddress } from '@/script/service-worker/update/address';
import type { CustomChain, UniqueChainId } from '@/types/chain';
import { getCoinChainId, isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from './useAccountAllAssets';

export function useCustomChain() {
  const { userAccounts, addedCustomChainList, customAssets, customErc20Assets, customCw20Assets, updateExtensionStorageStore } = useExtensionStorageStore(
    (state) => state,
  );

  const { refetch } = useAccountAllAssets();

  const addCustomChain = async (newChain: CustomChain) => {
    const storedAddedCustomChainList = await getExtensionLocalStorage('addedCustomChainList');

    const isAlreadyAdded = storedAddedCustomChainList.some(
      (item) => item.id.toLowerCase() === newChain.id.toLowerCase() && item.chainId === newChain.chainId && item.chainType === newChain.chainType,
    );

    if (isAlreadyAdded) {
      return;
    }

    const nonDuplicateCustomChainList = storedAddedCustomChainList.filter(
      (item) => !(item.id.toLowerCase() === newChain.id.toLowerCase() && item.chainId === newChain.chainId && item.chainType === newChain.chainType),
    );

    const updatedAddedCustomChainList = [...nonDuplicateCustomChainList, newChain];

    await updateExtensionStorageStore('addedCustomChainList', updatedAddedCustomChainList);

    const accountIds = userAccounts.map((account) => account.id);

    await Promise.all(
      accountIds.map(async (id) => {
        await customChainAddress(id);
      }),
    );

    await refetch();
  };

  const removeCustomChain = async (chainId: UniqueChainId) => {
    const storedAddedCustomChainList = await getExtensionLocalStorage('addedCustomChainList');

    const { chainType } = parseUniqueChainId(chainId);

    if (chainType === 'evm') {
      const filteredErc20Assets = customErc20Assets.filter((item) => getCoinChainId(item) !== chainId);
      await updateExtensionStorageStore('customErc20Assets', filteredErc20Assets);

      const filteredCustomAssets = customAssets.filter((item) => getCoinChainId(item) !== chainId);
      await updateExtensionStorageStore('customAssets', filteredCustomAssets);
    } else if (chainType === 'cosmos') {
      const filteredCw20Assets = customCw20Assets.filter((item) => getCoinChainId(item) !== chainId);
      await updateExtensionStorageStore('customCw20Assets', filteredCw20Assets);

      const filteredCustomAssets = customAssets.filter((item) => getCoinChainId(item) !== chainId);
      await updateExtensionStorageStore('customAssets', filteredCustomAssets);
    }

    const updatedAddedCustomChainList = storedAddedCustomChainList.filter((item) => !isMatchingUniqueChainId(item, chainId));

    await updateExtensionStorageStore('addedCustomChainList', updatedAddedCustomChainList);

    await refetch();
  };

  const editCustomChain = async (chainId: UniqueChainId, newChain: CustomChain) => {
    const storedAddedCustomChainList = await getExtensionLocalStorage('addedCustomChainList');

    const updatedAddedCustomChainList = storedAddedCustomChainList.map((item) => {
      if (isMatchingUniqueChainId(item, chainId)) {
        return newChain;
      }

      return item;
    });

    await updateExtensionStorageStore('addedCustomChainList', updatedAddedCustomChainList);

    await refetch();
  };

  return { addedCustomChainList, addCustomChain, removeCustomChain, editCustomChain };
}
