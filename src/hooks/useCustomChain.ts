import { customChainAddress } from '@/script/service-worker/update/address';
import type { CustomChain } from '@/types/chain';
import { isMatchingUniqueChainId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from './useAccountAllAssets';
import { useAccountAssets } from './useAccountAssets';

export function useCustomChain() {
  const { accounts, addedCustomChainList, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { refetch: refetchAccountAssets } = useAccountAssets();
  const { refetch: refetchAccountAllAssets } = useAccountAllAssets();

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

    const accountIds = accounts.map((account) => account.id);

    await Promise.all(
      accountIds.map(async (id) => {
        await customChainAddress(id);
      }),
    );

    // TODO 추가적으로 해당 체인의 기본 코인도 추가해주어야함.

    await refetchAccountAssets();
    await refetchAccountAllAssets();
  };

  const removeCustomChain = async (chainId: string) => {
    const storedAddedCustomChainList = await getExtensionLocalStorage('addedCustomChainList');
    const updatedAddedCustomChainList = storedAddedCustomChainList.filter((item) => !isMatchingUniqueChainId(item, chainId));

    await updateExtensionStorageStore('addedCustomChainList', updatedAddedCustomChainList);

    // TODO 추가적으로 해당 체인의 기본 코인도 삭제해주어야함.

    await refetchAccountAssets();
    await refetchAccountAllAssets();
  };

  return { addedCustomChainList, addCustomChain, removeCustomChain };
}
