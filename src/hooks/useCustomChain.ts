import { sendMessage } from '@/libs/extension';
import { customChainAddress } from '@/script/service-worker/update/address';
import type { CustomChain, UniqueChainId } from '@/types/chain';
import { getCoinChainId, getUniqueChainId, isMatchingUniqueChainId, parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { loadExtensionStorageStoreFromStorageByKey, useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useRefreshAccountAllAssets } from './useRefreshAccountAllAssets';

export function useCustomChain() {
  const userAccounts = useExtensionStorageStore((state) => state.userAccounts);
  const addedCustomChainList = useExtensionStorageStore((state) => state.addedCustomChainList);
  const customAssets = useExtensionStorageStore((state) => state.customAssets);
  const customErc20Assets = useExtensionStorageStore((state) => state.customErc20Assets);
  const customCw20Assets = useExtensionStorageStore((state) => state.customCw20Assets);
  const currentAccountId = useExtensionStorageStore((state) => state.currentAccountId);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);

  const { refreshAssets } = useRefreshAccountAllAssets();

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
        await loadExtensionStorageStoreFromStorageByKey(`${id}-custom-address`);
      }),
    );

    await sendMessage({
      target: 'SERVICE_WORKER',
      method: 'updateChainSpecificBalance',
      params: [currentAccountId, getUniqueChainId(newChain)],
    });

    await refreshAssets();
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

    await refreshAssets();
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

    await refreshAssets();
  };

  return { addedCustomChainList, addCustomChain, removeCustomChain, editCustomChain };
}
