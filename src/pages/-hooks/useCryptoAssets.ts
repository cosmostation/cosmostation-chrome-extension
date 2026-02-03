import { useEffect, useMemo } from 'react';

import { CURRENCY_TYPE } from '@/constants/currency';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGroupAccountAssets } from '@/hooks/useGroupAccountAssets';
import type { PortfolioCoinItem } from '@/pages/-entry';
import type { SimplePrice } from '@/types/coinGecko';
import type { CurrencyType } from '@/types/currency';
import { removeDuplicates, sortByReference } from '@/utils/array';
import { filterAssetsBySearch, getDefaultAssetsByChainId, getFilteredAssetsByChainId, sortAssetsByKey } from '@/utils/asset';
import { gte, plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { usePortfolioValueStore } from '@/zustand/hooks/usePortfolioValueStore';

type UseCryptoAssetsParams = {
  search: string;
  isSearchEmpty: boolean;
};

function applyPriceToAsset(
  asset: { totalDisplayAmount?: string; asset: { coinGeckoId?: string }; counts?: string },
  userCurrencyPreference: CurrencyType,
  coinGeckoPrice?: SimplePrice,
  usdCoinGeckoPrice?: SimplePrice,
): { value: string; dollarValue: string } {
  const displayAmount = asset.totalDisplayAmount || '0';
  const coinGeckoId = asset.asset.coinGeckoId;

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;
  const coinPriceInDollar = (coinGeckoId && usdCoinGeckoPrice?.[coinGeckoId]?.[CURRENCY_TYPE.USD]) || 0;

  return {
    value: times(displayAmount, coinPrice),
    dollarValue: times(displayAmount, coinPriceInDollar),
  };
}

function extractDisplayAmount(item: { totalBalance?: string; balance: string; asset: { decimals: number } }) {
  const balance = item.totalBalance || item.balance;
  return toDisplayDenomAmount(balance, item.asset.decimals) || '0';
}

export function useCryptoAssets({ search, isSearchEmpty }: UseCryptoAssetsParams) {
  const { data: accountAllAssets } = useAccountAllAssets({ filterByPreferAccountType: true });
  const { data: coinGeckoPrice, isLoading: isCoinGeckoPriceLoading } = useCoinGeckoPrice();
  const { data: usdCoinGeckoPrice, isLoading: isCoinGeckoPriceUSDLoading } = useCoinGeckoPrice('usd');

  const dashboardCoinSortKey = useExtensionStorageStore((state) => state.dashboardCoinSortKey);
  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);
  const isHideSmalValue = useExtensionStorageStore((state) => state.isHideSmalValue);
  const selectedChainFilterId = useExtensionStorageStore((state) => state.selectedChainFilterId);

  const { groupAccountAssets, isLoading: isGroupAssetsLoading } = useGroupAccountAssets();

  const isFirstBalanceLoading = !groupAccountAssets?.singleAccountAssets.length && !groupAccountAssets?.groupAccountAssets.length;
  const isLoading = isFirstBalanceLoading || isGroupAssetsLoading || isCoinGeckoPriceLoading || isCoinGeckoPriceUSDLoading;

  const isSearchActive = useMemo(() => search.length > 1, [search.length]);

  const chainDefaultCoinsBase = useMemo(
    () => getDefaultAssetsByChainId(accountAllAssets?.flatAccountAssets, selectedChainFilterId),
    [accountAllAssets?.flatAccountAssets, selectedChainFilterId],
  );

  const baseAssets = useMemo(() => {
    if (!groupAccountAssets) return [];

    const { groupAccountAssets: grouped, singleAccountAssets: singles, groupMap } = groupAccountAssets;
    const isSearchOrFilterMode = (!isSearchEmpty && isSearchActive) || !!selectedChainFilterId;

    if (isSearchOrFilterMode) {
      const ungroupedAssets = Object.values(groupMap)
        .flat()
        .map((item) => ({
          ...item,
          counts: '1',
          totalDisplayAmount: extractDisplayAmount(item),
        }));
      return [...ungroupedAssets, ...singles];
    }

    return [...grouped, ...singles];
  }, [groupAccountAssets, isSearchEmpty, isSearchActive, selectedChainFilterId]);

  const assetsWithPrice = useMemo<PortfolioCoinItem[]>(
    () =>
      baseAssets.map((item) => {
        const priceInfo = applyPriceToAsset(item, userCurrencyPreference, coinGeckoPrice, usdCoinGeckoPrice);
        return { ...item, ...priceInfo };
      }),
    [baseAssets, coinGeckoPrice, usdCoinGeckoPrice, userCurrencyPreference],
  );

  const chainDefaultCoinsWithPrice = useMemo(
    () =>
      chainDefaultCoinsBase?.map((item) => {
        const totalDisplayAmount = extractDisplayAmount(item);
        const priceInfo = applyPriceToAsset({ ...item, totalDisplayAmount }, userCurrencyPreference, coinGeckoPrice, usdCoinGeckoPrice);
        return { ...item, counts: '1', totalDisplayAmount, ...priceInfo };
      }),
    [chainDefaultCoinsBase, coinGeckoPrice, usdCoinGeckoPrice, userCurrencyPreference],
  );

  const sortedAssets = useMemo(() => {
    const assetsAboveMinValue = isHideSmalValue ? assetsWithPrice.filter((coin) => gte(coin.dollarValue, '1')) : assetsWithPrice;

    const assetsByChain = getFilteredAssetsByChainId(assetsAboveMinValue, selectedChainFilterId || undefined);

    const assetsWithDefaults =
      selectedChainFilterId && chainDefaultCoinsWithPrice
        ? removeDuplicates([...chainDefaultCoinsWithPrice, ...assetsByChain], (a, b) => a.uniqueCoinId === b.uniqueCoinId)
        : assetsByChain;

    const assetsMatchingSearch = filterAssetsBySearch(assetsWithDefaults, search, isSearchEmpty);

    const assetsSortedByKey = sortAssetsByKey(assetsMatchingSearch, dashboardCoinSortKey);

    return chainDefaultCoinsWithPrice && chainDefaultCoinsWithPrice?.length > 0
      ? sortByReference(assetsSortedByKey, chainDefaultCoinsWithPrice, (a, b) => a.uniqueCoinId === b.uniqueCoinId)
      : assetsSortedByKey;
  }, [assetsWithPrice, isHideSmalValue, selectedChainFilterId, chainDefaultCoinsWithPrice, search, isSearchEmpty, dashboardCoinSortKey]);

  const totalValue = useMemo(() => sortedAssets.reduce((acc, cur) => plus(acc, cur.value), '0'), [sortedAssets]);

  const hasAssets = sortedAssets.length > 0;

  const setPortfolioValue = usePortfolioValueStore((state) => state.setPortfolioValue);

  useEffect(() => {
    setPortfolioValue(totalValue, hasAssets);
  }, [totalValue, hasAssets, setPortfolioValue]);

  return {
    filteredAssetsBySearch: sortedAssets,
    totalValue,
    hasAssets,
    isLoading,
    selectedChainFilterId,
  };
}
