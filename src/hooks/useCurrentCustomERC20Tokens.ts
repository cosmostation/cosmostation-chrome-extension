import type { EvmErc20Asset } from '@/types/asset';
import { getCoinId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useRefreshAccountAllAssets } from './useRefreshAccountAllAssets';

export function useCurrentCustomERC20Tokens() {
  const customErc20Assets = useExtensionStorageStore((state) => state.customErc20Assets);
  const updateExtensionStorageStore = useExtensionStorageStore((state) => state.updateExtensionStorageStore);
  const { refreshAssets } = useRefreshAccountAllAssets();

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

    await refreshAssets();
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

    await refreshAssets();
  };

  const removeCustomERC20Token = async (coinId: string) => {
    const storedCustomERC20 = await getExtensionLocalStorage('customErc20Assets');
    const updatedCustomTokens = storedCustomERC20.filter((item) => getCoinId(item) !== coinId);

    await updateExtensionStorageStore('customErc20Assets', updatedCustomTokens);

    await refreshAssets();
  };

  return { currentCustomERC20Tokens, addCustomERC20Token, addCustomERC20Tokens, removeCustomERC20Token };
}
