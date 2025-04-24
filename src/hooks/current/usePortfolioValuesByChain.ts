import { useMemo } from 'react';

import { getFilteredAssetsByChainId, getFilteredChainsByChainId } from '@/utils/asset';
import { plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getUniqueChainId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from '../useAccountAllAssets';
import { useCoinGeckoPrice } from '../useCoinGeckoPrice';
import { useCurrentAccount } from '../useCurrentAccount';

export function usePortfolioValuesByChain(accountId?: string) {
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);

  const { currentAccount } = useCurrentAccount();
  const currentAccountId = accountId || currentAccount.id;

  const { data: accountAllAssets } = useAccountAllAssets({
    accountId: currentAccountId,
    filterByPreferAccountType: true,
  });

  const chainList = useMemo(() => getFilteredChainsByChainId(accountAllAssets?.flatAccountAssets), [accountAllAssets?.flatAccountAssets]);

  const portfolioValuesByChain = useMemo(
    () =>
      chainList.map((item) => {
        const coins = getFilteredAssetsByChainId(accountAllAssets?.flatAccountAssets, getUniqueChainId(item));

        const aggregateValue = coins.reduce((acc, item) => {
          const displayAmount = toDisplayDenomAmount(item.balance || '0', item.asset.decimals || 0);
          const coinPrice = (item.asset.coinGeckoId && coinGeckoPrice?.[item.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;

          const value = times(displayAmount, coinPrice);

          return plus(acc, value);
        }, '0');

        return {
          chain: item,
          totalValue: aggregateValue,
        };
      }),
    [accountAllAssets?.flatAccountAssets, chainList, coinGeckoPrice, userCurrencyPreference],
  );

  return { portfolioValuesByChain };
}
