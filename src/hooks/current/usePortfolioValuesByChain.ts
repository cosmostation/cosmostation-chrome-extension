import { useMemo } from 'react';

import type { FlatAccountAssets } from '@/types/accountAssets';
import type { ChainBase, UniqueChainId } from '@/types/chain';
import { getFilteredAssetsByChainId, getMainAssetByChainId, isStakeableAsset } from '@/utils/asset';
import { isTestnetChain } from '@/utils/chain';
import { plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { getUniqueChainId, isMatchingUniqueChainId, isSameChain } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from '../useAccountAllAssets';
import { useCoinGeckoPrice } from '../useCoinGeckoPrice';
import { useCurrentAccount } from '../useCurrentAccount';

interface ChainWithValue extends ChainBase {
  isActive: boolean;
  value: string;
  mainAsset?: FlatAccountAssets;
  isTestnet: boolean;
  isAllNetwork?: boolean;
}
interface CategorizedChain {
  testnet: ChainWithValue[];
  mainnet: ChainWithValue[];
}

interface UsePortfolioValuesByChainProps {
  chainList: ChainBase[];
  accountId?: string;
  currentChainId?: UniqueChainId;
  isManageAsset?: boolean;
}

export function usePortfolioValuesByChain({ chainList, accountId, currentChainId, isManageAsset = false }: UsePortfolioValuesByChainProps) {
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const userCurrencyPreference = useExtensionStorageStore((state) => state.userCurrencyPreference);

  const { currentAccount } = useCurrentAccount();
  const currentAccountId = accountId || currentAccount.id;

  const { data: accountAllAssets } = useAccountAllAssets({
    accountId: currentAccountId,
    filterByPreferAccountType: true,
  });

  const portfolioValuesByChain = useMemo(
    () =>
      chainList.map((item) => {
        const coins = getFilteredAssetsByChainId(accountAllAssets?.flatAccountAssets, getUniqueChainId(item));

        const aggregateValue = coins.reduce((acc, item) => {
          const balance = isStakeableAsset(item) ? item.totalBalance || '0' : item.balance;

          const displayAmount = toDisplayDenomAmount(balance, item.asset.decimals || 0);
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

  const categorizedChainsWithValue = useMemo(() => {
    return chainList.reduce(
      (acc: CategorizedChain, item) => {
        const isActive = isMatchingUniqueChainId(item, currentChainId);
        const value = portfolioValuesByChain.find((chain) => isSameChain(chain.chain, item));
        const mainAsset = isManageAsset ? getMainAssetByChainId(accountAllAssets?.flatAccountAssets, getUniqueChainId(item)) : undefined;

        const isTestnet = isTestnetChain(item.id);

        const chainWithValue: ChainWithValue = {
          ...item,
          isActive: isActive,
          value: value?.totalValue || '0',
          mainAsset,
          isTestnet,
        };

        (isTestnet ? acc.testnet : acc.mainnet).push(chainWithValue);

        return acc;
      },
      { testnet: [], mainnet: [] },
    );
  }, [accountAllAssets?.flatAccountAssets, chainList, currentChainId, isManageAsset, portfolioValuesByChain]);

  return { portfolioValuesByChain, categorizedChainsWithValue };
}
