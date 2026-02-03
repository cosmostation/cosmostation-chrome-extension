import { useMemo } from 'react';

import type { FlatAccountAssets } from '@/types/accountAssets';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useCoinGeckoPrice } from './useCoinGeckoPrice';

export type AssetWithValue<T = FlatAccountAssets> = T & {
  value: string;
  displayAmount: string;
};

type UseAssetPricingOptions<T> = {
  getBalance?: (item: T) => string;
};

export function useAssetPricing<T extends FlatAccountAssets>(assets: T[] | undefined, options?: UseAssetPricingOptions<T>): AssetWithValue<T>[] {
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);

  return useMemo(() => {
    if (!assets) return [];

    return assets.map((item) => {
      const balance = options?.getBalance?.(item) ?? item.balance;
      const displayAmount = toDisplayDenomAmount(balance, item.asset.decimals);
      const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;
      const value = times(displayAmount, coinPrice);

      return { ...item, value, displayAmount };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, coinGeckoPrice, options?.getBalance, userCurrencyPreference]);
}
