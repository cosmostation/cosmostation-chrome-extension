import { useEffect, useMemo } from 'react';

import { CURRENCY_TYPE } from '@/constants/currency';
import { DASHBOARD_COIN_SORT_KEY } from '@/constants/sortKey';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGroupAccountAssets } from '@/hooks/useGroupAccountAssets';
import type { PortfolioCoinItem } from '@/pages/-entry';
import type { DashboardCoinSortKeyType } from '@/types/sortKey';
import { removeDuplicates } from '@/utils/array';
import { getDefaultAssetsByChainId, getFilteredAssetsByChainId } from '@/utils/asset';
import { gte, minus, plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { usePortfolioValueStore } from '@/zustand/hooks/usePortfolioValueStore';

type UseCryptoAssetsParams = {
  search: string;
  debouncedSearch: string;
};

type PriceData = Record<string, Record<string, number>>;

function applyPriceToAsset(
  asset: { totalDisplayAmount?: string; asset: { coinGeckoId?: string }; counts?: string },
  coinGeckoPrice: PriceData | undefined,
  usdCoinGeckoPrice: PriceData | undefined,
  userCurrencyPreference: string,
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

function sortAssets(assets: PortfolioCoinItem[], sortKey: DashboardCoinSortKeyType): PortfolioCoinItem[] {
  return assets.toSorted((a, b) => {
    if (sortKey === DASHBOARD_COIN_SORT_KEY.VALUE_HIGH_ORDER) {
      return Number(minus(b.value, a.value));
    }
    if (sortKey === DASHBOARD_COIN_SORT_KEY.ALPHABETICAL_ASC) {
      return a.asset.symbol.localeCompare(b.asset.symbol);
    }
    return 0;
  });
}

function filterBySearch(assets: PortfolioCoinItem[], searchTerm: string): PortfolioCoinItem[] {
  if (!searchTerm || searchTerm.length <= 1) return assets;

  const lowerSearch = searchTerm.toLowerCase();
  return assets.filter((asset) => {
    const searchTargets = [asset.asset.symbol, asset.asset.id];
    return searchTargets.some((target) => target.toLowerCase().includes(lowerSearch));
  });
}

export function useCryptoAssets({ search, debouncedSearch }: UseCryptoAssetsParams) {
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

  const chainDefaultCoinsBase = useMemo(
    () => getDefaultAssetsByChainId(accountAllAssets?.flatAccountAssets, selectedChainFilterId),
    [accountAllAssets?.flatAccountAssets, selectedChainFilterId],
  );

  const baseAssets = useMemo(() => {
    if (!groupAccountAssets) return [];

    const { groupAccountAssets: grouped, singleAccountAssets: singles, groupMap } = groupAccountAssets;
    const isSearchOrFilterMode = (!!search && debouncedSearch.length > 1) || !!selectedChainFilterId;

    if (isSearchOrFilterMode) {
      const ungroupedAssets = Object.values(groupMap)
        .flat()
        .map((item) => {
          const balance = 'totalBalance' in item ? item.totalBalance || '0' : item.balance;
          return {
            ...item,
            counts: '1',
            totalDisplayAmount: toDisplayDenomAmount(balance, item.asset.decimals),
          };
        });
      return [...ungroupedAssets, ...singles];
    }

    return [...grouped, ...singles];
  }, [groupAccountAssets, search, debouncedSearch.length, selectedChainFilterId]);

  const assetsWithPrice = useMemo<PortfolioCoinItem[]>(() => {
    return baseAssets.map((item) => {
      const priceInfo = applyPriceToAsset(item, coinGeckoPrice, usdCoinGeckoPrice, userCurrencyPreference);
      return { ...item, ...priceInfo } as PortfolioCoinItem;
    });
  }, [baseAssets, coinGeckoPrice, usdCoinGeckoPrice, userCurrencyPreference]);

  const filteredByValue = useMemo(() => {
    if (!isHideSmalValue) return assetsWithPrice;
    return assetsWithPrice.filter((coin) => gte(coin.dollarValue, '1'));
  }, [assetsWithPrice, isHideSmalValue]);

  const filteredAssets = useMemo(() => {
    const chainFiltered = getFilteredAssetsByChainId(filteredByValue, selectedChainFilterId || undefined);

    let merged = chainFiltered;
    if (selectedChainFilterId && chainDefaultCoinsBase) {
      const chainDefaultCoinsWithPrice = chainDefaultCoinsBase.map((item) => {
        const balance = 'totalBalance' in item ? item.totalBalance || '0' : item.balance;
        const totalDisplayAmount = toDisplayDenomAmount(balance, item.asset.decimals) || '0';
        const priceInfo = applyPriceToAsset({ ...item, totalDisplayAmount }, coinGeckoPrice, usdCoinGeckoPrice, userCurrencyPreference);
        return {
          ...item,
          counts: '1',
          totalDisplayAmount,
          ...priceInfo,
        } as PortfolioCoinItem;
      });

      merged = removeDuplicates([...chainDefaultCoinsWithPrice, ...chainFiltered], (a, b) => a.asset.id === b.asset.id);
    }

    return filterBySearch(merged, debouncedSearch);
  }, [filteredByValue, selectedChainFilterId, chainDefaultCoinsBase, coinGeckoPrice, usdCoinGeckoPrice, userCurrencyPreference, debouncedSearch]);

  const sortedAssets = useMemo(() => sortAssets(filteredAssets, dashboardCoinSortKey), [filteredAssets, dashboardCoinSortKey]);

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
