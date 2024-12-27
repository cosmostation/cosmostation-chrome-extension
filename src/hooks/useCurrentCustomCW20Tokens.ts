import type { CosmosCw20Asset } from '@/types/asset';
import { getCoinId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from './useAccountAllAssets';
import { useAccountAssets } from './useAccountAssets';
import { useGroupAccountAssets } from './useGroupAccountAssets';

export function useCurrentCustomCW20Tokens() {
  const { customCw20Assets, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const { refetch: refetchAccountAssets } = useAccountAssets();
  const { refetch: refetchAccountAllAssets } = useAccountAllAssets();
  const { refetch: refetchGroupAssets } = useGroupAccountAssets();

  const currentCustomCW20Tokens = customCw20Assets;

  const addCustomCW20Token = async (asset: CosmosCw20Asset) => {
    const storedCW20Assets = await getExtensionLocalStorage('cw20Assets');

    const isAlreadySupport = storedCW20Assets.some((item) => item.id.toLowerCase() === asset.id.toLowerCase() && item.chainId === asset.chainId);

    if (isAlreadySupport) {
      return;
    }

    const storedCustomCW20 = await getExtensionLocalStorage('customCw20Assets');
    const filteredExistingTokens = storedCustomCW20.filter((item) => !(item.id.toLowerCase() === asset.id.toLowerCase() && item.chainId === asset.chainId));

    const updatedCustomTokens = [...filteredExistingTokens, asset];

    await updateExtensionStorageStore('customCw20Assets', updatedCustomTokens);

    await refetchAccountAssets();
    await refetchAccountAllAssets();
    await refetchGroupAssets();
  };

  const removeCustomCW20Token = async (coinId: string) => {
    const storedCustomCW20 = await getExtensionLocalStorage('customCw20Assets');
    const updatedCustomTokens = storedCustomCW20.filter((item) => getCoinId(item) !== coinId);

    await updateExtensionStorageStore('customCw20Assets', updatedCustomTokens);

    await refetchAccountAssets();
    await refetchAccountAllAssets();
    await refetchGroupAssets();
  };

  return { currentCustomCW20Tokens, addCustomCW20Token, removeCustomCW20Token };
}
