import type { EvmErc20Asset } from '@/types/asset';
import { getCoinId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from './useAccountAllAssets';
import { useAccountAssets } from './useAccountAssets';

export function useCurrentCustomERC20Tokens() {
  const { customErc20Assets, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { refetch: refetchAccountAssets } = useAccountAssets();
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

    await refetchAccountAssets();
    await refetchAccountAllAssets();
  };

  const removeCustomERC20Token = async (coinId: string) => {
    const storedCustomERC20 = await getExtensionLocalStorage('customErc20Assets');
    const updatedCustomTokens = storedCustomERC20.filter((item) => getCoinId(item) !== coinId);

    await updateExtensionStorageStore('customErc20Assets', updatedCustomTokens);

    await refetchAccountAssets();
    await refetchAccountAllAssets();
  };

  return { currentCustomERC20Tokens, addCustomERC20Token, removeCustomERC20Token };
}
