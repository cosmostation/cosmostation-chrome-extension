import { useMemo } from 'react';

import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import type { FlatAccountAssets, SingleOrGroupAccountAssets } from '@/types/accountAssets';
import { lt, plus, toDisplayDenomAmount } from '@/utils/numbers';

import { useAccountAllAssets } from './useAccountAllAssets';
import { useCurrentAccount } from './useCurrentAccount';

export type SingleAndGroupedAssets = {
  singles: FlatAccountAssets[];
  groups: Record<string, FlatAccountAssets[]>;
};

export type UseGroupAccountAssetsResponse = {
  singleAccountAssets: SingleOrGroupAccountAssets[];
  groupAccountAssets: SingleOrGroupAccountAssets[];
  groupMap: Record<string, FlatAccountAssets[]>;
};

type UseGroupAccountAssetsProps =
  | {
      accountId?: string;
    }
  | undefined;

function getAssetDisplayAmount(asset: FlatAccountAssets): string {
  const totalBalance = 'totalBalance' in asset ? asset.totalBalance || asset.balance || '0' : asset.balance;
  return toDisplayDenomAmount(totalBalance, asset.asset.decimals);
}

export function useGroupAccountAssets({ accountId }: UseGroupAccountAssetsProps = {}) {
  const { currentAccount } = useCurrentAccount();
  const param = accountId || currentAccount.id;

  const {
    data: currentAccountAssets,
    isLoading,
    isFetching,
  } = useAccountAllAssets({
    accountId: param,
    disableBalanceFilter: false,
    disableHiddenFilter: false,
    filterByPreferAccountType: true,
  });

  const groupAccountAssets = useMemo(() => {
    const flatAssets = currentAccountAssets?.flatAccountAssets;
    if (!flatAssets?.length) return null;

    const singles: SingleOrGroupAccountAssets[] = [];
    const groupMap: Record<string, FlatAccountAssets[]> = {};

    const groupInfo: Record<
      string,
      {
        representative: FlatAccountAssets;
        totalAmount: string;
        count: number;
        oldestUpdateTime?: number;
      }
    > = {};

    for (const asset of flatAssets) {
      const displayAmount = getAssetDisplayAmount(asset);
      const coinGeckoId = asset.asset.coinGeckoId;

      if (!coinGeckoId) {
        singles.push({
          ...asset,
          totalDisplayAmount: displayAmount,
          counts: '1',
        });
        continue;
      }

      if (!groupInfo[coinGeckoId]) {
        groupInfo[coinGeckoId] = {
          representative: asset,
          totalAmount: displayAmount,
          count: 1,
          oldestUpdateTime: asset.lastUpdatedAtMs || undefined,
        };
        groupMap[coinGeckoId] = [asset];
      } else {
        const info = groupInfo[coinGeckoId];

        info.totalAmount = plus(info.totalAmount, displayAmount);
        info.count += 1;
        groupMap[coinGeckoId].push(asset);

        if (asset.lastUpdatedAtMs && (!info.oldestUpdateTime || lt(asset.lastUpdatedAtMs, info.oldestUpdateTime))) {
          info.oldestUpdateTime = asset.lastUpdatedAtMs;
        }

        if (shouldReplaceRepresentative(info.representative, asset)) {
          info.representative = asset;
        }
      }
    }

    const groupedAssets: SingleOrGroupAccountAssets[] = [];
    const finalGroupMap: Record<string, FlatAccountAssets[]> = {};

    for (const [coinGeckoId, info] of Object.entries(groupInfo)) {
      if (info.count === 1) {
        singles.push({
          ...info.representative,
          totalDisplayAmount: info.totalAmount,
          counts: '1',
        });
      } else {
        finalGroupMap[coinGeckoId] = groupMap[coinGeckoId];
        groupedAssets.push({
          ...info.representative,
          totalDisplayAmount: info.totalAmount,
          counts: info.count.toString(),
          lastUpdatedAtMs: info.oldestUpdateTime,
        });
      }
    }

    return {
      singleAccountAssets: singles,
      groupAccountAssets: groupedAssets,
      groupMap: finalGroupMap,
    };
  }, [currentAccountAssets?.flatAccountAssets]);

  return { groupAccountAssets, isLoading, isFetching };
}

function shouldReplaceRepresentative(existingBest: FlatAccountAssets, newAsset: FlatAccountAssets): boolean {
  const isNewNative = newAsset.asset.type === 'native';
  const isExistingNative = existingBest.asset.type === 'native';

  if (!isExistingNative && isNewNative) {
    return true;
  }

  if (isExistingNative && isNewNative) {
    const isEthereumMainnet = newAsset.asset.id === NATIVE_EVM_COIN_ADDRESS && newAsset.chain.id === 'ethereum';
    return isEthereumMainnet;
  }

  return false;
}
