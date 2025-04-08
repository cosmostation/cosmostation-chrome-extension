import { useMemo } from 'react';

import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import type { FlatAccountAssets, SingleOrGroupAccountAssets } from '@/types/accountAssets';
import { plus, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId } from '@/utils/queryParamGenerator';

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

export function useGroupAccountAssets({ accountId }: UseGroupAccountAssetsProps = {}) {
  const { currentAccount } = useCurrentAccount();

  const param = accountId || currentAccount.id;

  const { data: currentAccountAssets, isLoading } = useAccountAllAssets({
    accountId: param,
    disableBalanceFilter: false,
    disableHiddenFilter: false,
    filterByPreferAccountType: true,
  });

  const groupAccountAssets = useMemo(() => {
    const assetToSingleOrGroup = currentAccountAssets?.flatAccountAssets.reduce<SingleAndGroupedAssets>(
      (acc, asset) => {
        if (!asset.asset.coinGeckoId) {
          acc.singles.push(asset);
          return acc;
        }

        if (!acc.groups[asset.asset.coinGeckoId]) {
          acc.groups[asset.asset.coinGeckoId] = [asset];
        } else {
          acc.groups[asset.asset.coinGeckoId].push(asset);
        }
        return acc;
      },
      { singles: [], groups: {} },
    );

    if (!assetToSingleOrGroup) return null;

    const singles = assetToSingleOrGroup.singles;
    const groups = assetToSingleOrGroup.groups;

    const validGroups = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(groups).filter(([_, value]) => {
        return value.length > 1;
      }),
    );

    const invalidGroups = Object.values(
      Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(groups).filter(([_, value]) => {
          return value.length === 1;
        }),
      ),
    );

    const singleAccountAssets = [...singles, ...invalidGroups.flat()].map((item) => {
      return {
        ...item,
        totalDisplayAmount: toDisplayDenomAmount(item.balance, item.asset.decimals),
        counts: '1',
      };
    });

    const coinGeckoIdToTotalDisplayAmount = Object.entries(validGroups).reduce((acc: Record<string, string>, [coinGeckoId, value]) => {
      const filteredAccountAssets =
        currentAccountAssets?.flatAccountAssets.filter((item) => value.some((v) => getCoinId(v.asset) === getCoinId(item.asset))) || [];

      const totalAmount = filteredAccountAssets.reduce((totalAmount, cur) => {
        const displayAmount = toDisplayDenomAmount(cur.balance, cur.asset.decimals);

        return plus(totalAmount, displayAmount);
      }, '0');

      return { ...acc, [coinGeckoId]: totalAmount };
    }, {});

    const groupAccountAssets = Object.values(validGroups).map((item) => {
      const sortList = item.sort((a) => {
        if (a.asset.type === 'native') {
          return -1;
        }
        return 1;
      });

      const firstItem = sortList[0].asset.id === NATIVE_EVM_COIN_ADDRESS ? sortList.find((v) => v.chain.id === 'ethereum') || sortList[0] : sortList[0];

      return {
        ...firstItem,
        totalDisplayAmount: coinGeckoIdToTotalDisplayAmount[firstItem.asset.coinGeckoId || ''] || '0',
        counts: item.length.toString(),
      };
    });

    return {
      singleAccountAssets,
      groupAccountAssets,
      groupMap: validGroups,
    };
  }, [currentAccountAssets?.flatAccountAssets]);

  return { groupAccountAssets, isLoading };
}
