import type { EvmErc20Asset } from '@/types/asset';
import { getCoinId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from './useAccountAllAssets';

export function useCurrentCustomERC20Tokens() {
  const { customErc20Assets, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { refetch: refetchAccountAllAssets } = useAccountAllAssets();

  const currentCustomERC20Tokens = customErc20Assets;

  const addCustomERC20Token = async (asset: EvmErc20Asset) => {
    const storedERC20Assets = await getExtensionLocalStorage('erc20Assets');

    const isAlreadySupport = storedERC20Assets.some((item) => item.id.toLowerCase() === asset.id.toLowerCase() && item.chainId === asset.chainId);

    if (isAlreadySupport) {
      return;
    }

    const storedCustomERC20 = await getExtensionLocalStorage('customErc20Assets');
    const filteredExistingTokens = storedCustomERC20.filter((item) => !(item.id.toLowerCase() === asset.id.toLowerCase() && item.chainId === asset.chainId));

    const updatedCustomTokens = [...filteredExistingTokens, asset];

    await updateExtensionStorageStore('customErc20Assets', updatedCustomTokens);

    await refetchAccountAllAssets();
  };

  const addCustomERC20Tokens = async (assets: EvmErc20Asset[]) => {
    const storedERC20Assets = await getExtensionLocalStorage('erc20Assets');

    const newlyUnstoredTokens = assets.filter(
      (item) => !storedERC20Assets.some((storedItem) => storedItem.id.toLowerCase() === item.id.toLowerCase() && storedItem.chainId === item.chainId),
    );

    if (newlyUnstoredTokens.length === 0) {
      return;
    }

    const storedCustomERC20 = await getExtensionLocalStorage('customErc20Assets');
    const filteredExistingTokens = storedCustomERC20.filter(
      (item) => !newlyUnstoredTokens.some((filteredItem) => filteredItem.id.toLowerCase() === item.id.toLowerCase() && filteredItem.chainId === item.chainId),
    );

    const updatedCustomTokens = [...filteredExistingTokens, ...newlyUnstoredTokens];

    await updateExtensionStorageStore('customErc20Assets', updatedCustomTokens);

    await refetchAccountAllAssets();
  };

  const removeCustomERC20Token = async (coinId: string) => {
    const storedCustomERC20 = await getExtensionLocalStorage('customErc20Assets');
    const updatedCustomTokens = storedCustomERC20.filter((item) => getCoinId(item) !== coinId);

    await updateExtensionStorageStore('customErc20Assets', updatedCustomTokens);

    await refetchAccountAllAssets();
  };

  return { currentCustomERC20Tokens, addCustomERC20Token, addCustomERC20Tokens, removeCustomERC20Token };
}
