import { useMemo, useRef } from 'react';

import { NATIVE_EVM_COIN_ADDRESS } from '@/constants/evm';
import type { FlatAccountAssets } from '@/types/accountAssets';
import type { UniqueCoinId } from '@/types/asset';
import type { UniqueChainId } from '@/types/chain';
import type { CommonSortKeyType } from '@/types/sortKey';
import { sortByReference } from '@/utils/array';
import { filterAssetsBySearch, getFilteredAssetsByChainId, sortAssetsByKey } from '@/utils/asset';
import { isEqualsIgnoringCase, shorterAddress } from '@/utils/string';

import { type AssetWithValue, useAssetPricing } from './useAssetPricing';
import { useCurrentCustomCW20Tokens } from './useCurrentCustomCW20Tokens';
import { useCurrentCustomERC20Tokens } from './useCurrentCustomERC20Tokens';
import { useCurrentHiddenAssetIds } from './useCurrentHiddenAssetIds';
import { useCurrentVisibleAssetIds } from './useCurrentVisibleAssetIds';
import { useCustomAssets } from './useCustomAssets';

export type ProcessedAsset = FlatAccountAssets & {
  value: string;
  isHiddenState: boolean;
  displayAmount: string;
  resolvedAssetId: string;
  isBalanceZero: boolean;
  isCustomToken: boolean;
  innerTokenType: 'custom-cw20' | 'custom-erc20' | 'supported-asset' | 'custom-asset';
};

type UseProcessedAssetsParams = {
  baseCoinList: FlatAccountAssets[];
  sortOption: CommonSortKeyType;
  currentSelectedChainId: UniqueChainId | undefined;
  search: string;
  debouncedSearch: string;
};

function getHiddenState(
  coinId: UniqueCoinId,
  isCustomToken: boolean,
  isBalanceZero: boolean,
  hiddenAssetSet: Set<UniqueCoinId> | undefined,
  customHiddenAssetSet: Set<UniqueCoinId> | undefined,
  visibleAssetSet: Set<UniqueCoinId> | undefined,
): boolean {
  const isVisibleAsset = visibleAssetSet?.has(coinId);
  if (isCustomToken || isVisibleAsset) return false;

  const isHiddenAsset = customHiddenAssetSet?.has(coinId) || hiddenAssetSet?.has(coinId);
  if (isHiddenAsset || isBalanceZero) return true;

  return false;
}

function useSortedAndFilteredList(
  baseCoinList: FlatAccountAssets[],
  sortOption: CommonSortKeyType,
  currentSelectedChainId: UniqueChainId | undefined,
  search: string,
  debouncedSearch: string,
): AssetWithValue<FlatAccountAssets>[] {
  const pricedAssets = useAssetPricing(baseCoinList);

  const sorted = useMemo(() => sortAssetsByKey(pricedAssets, sortOption), [pricedAssets, sortOption]);

  return useMemo(() => {
    const filteredByChain = getFilteredAssetsByChainId(sorted, currentSelectedChainId);
    return filterAssetsBySearch(filteredByChain, search, debouncedSearch);
  }, [sorted, currentSelectedChainId, search, debouncedSearch]);
}

function useFinalProcessedList(
  filteredCoinList: AssetWithValue<FlatAccountAssets>[],
  currentSelectedChainId: UniqueChainId | undefined,
): { list: ProcessedAsset[]; visibleCount: number } {
  const { currentCustomHiddenAssetIdsSet: customHiddenAssetSet, currentCustomAssetIdsSet: customAssetSet } = useCustomAssets();
  const { currentHiddenAssetIdsSet } = useCurrentHiddenAssetIds();
  const { currentVisibleAssetIdsSet } = useCurrentVisibleAssetIds();
  const { currentCustomERC20TokenIdsSet } = useCurrentCustomERC20Tokens();
  const { currentCustomCW20TokenIdsSet } = useCurrentCustomCW20Tokens();

  const initialStateSnapshotRef = useRef<{
    hiddenAssetIds: Set<UniqueCoinId>;
    visibleAssetIds: Set<UniqueCoinId>;
    hiddenCustomAssetIds: Set<UniqueCoinId>;
  } | null>(null);

  if (initialStateSnapshotRef.current === null && (currentHiddenAssetIdsSet?.size || currentVisibleAssetIdsSet?.size || customHiddenAssetSet?.size)) {
    initialStateSnapshotRef.current = {
      hiddenAssetIds: new Set(currentHiddenAssetIdsSet ?? []),
      visibleAssetIds: new Set(currentVisibleAssetIdsSet ?? []),
      hiddenCustomAssetIds: new Set(customHiddenAssetSet ?? []),
    };
  }

  return useMemo(() => {
    const initialSnapshot = initialStateSnapshotRef.current;
    const sortingHiddenAssetIds = initialSnapshot?.hiddenAssetIds ?? currentHiddenAssetIdsSet;
    const sortingVisibleAssetIds = initialSnapshot?.visibleAssetIds ?? currentVisibleAssetIdsSet;
    const sortingHiddenCustomAssetIds = initialSnapshot?.hiddenCustomAssetIds ?? customHiddenAssetSet;

    const { visible, hidden, visibleCount } = filteredCoinList.reduce<{ visible: ProcessedAsset[]; hidden: ProcessedAsset[]; visibleCount: number }>(
      (acc, coin) => {
        const currentCoinId = coin.uniqueCoinId;

        const isCustomERC20 = currentCustomERC20TokenIdsSet.has(currentCoinId);
        const isCustomCW20 = currentCustomCW20TokenIdsSet.has(currentCoinId);
        const isCustomToken = isCustomERC20 || isCustomCW20;

        const isCustomAsset = customAssetSet.has(currentCoinId);

        const isBalanceZero = coin.balance === '0';

        const isHiddenState = getHiddenState(
          currentCoinId,
          isCustomToken,
          isBalanceZero,
          currentHiddenAssetIdsSet,
          customHiddenAssetSet,
          currentVisibleAssetIdsSet,
        );

        const resolvedAssetId =
          coin.chain.mainAssetDenom === coin.asset.id || coin.asset.id === NATIVE_EVM_COIN_ADDRESS
            ? coin.asset.description
            : coin.asset.id.length > 15
              ? shorterAddress(coin.asset.id, 16)
              : coin.asset.id;

        const innerTokenType = (() => {
          if (isCustomERC20) {
            return 'custom-erc20';
          } else if (isCustomCW20) {
            return 'custom-cw20';
          } else if (isCustomAsset) {
            return 'custom-asset';
          } else {
            return 'supported-asset';
          }
        })();

        // NOTE 초기 정렬용 스냅샷뜬 히든스테이트
        const isSortingHidden = getHiddenState(
          currentCoinId,
          isCustomToken,
          isBalanceZero,
          sortingHiddenAssetIds,
          sortingHiddenCustomAssetIds,
          sortingVisibleAssetIds,
        );

        const processedItem: ProcessedAsset = {
          ...coin,
          isHiddenState,
          resolvedAssetId: resolvedAssetId || '-',
          isBalanceZero,
          isCustomToken,
          innerTokenType,
        };

        if (isSortingHidden) {
          acc.hidden.push(processedItem);
        } else {
          acc.visible.push(processedItem);
        }

        if (!isHiddenState) acc.visibleCount++;

        return acc;
      },
      { visible: [] as ProcessedAsset[], hidden: [] as ProcessedAsset[], visibleCount: 0 },
    );

    let result = [...visible, ...hidden];

    if (currentSelectedChainId && result.length > 0) {
      const denoms = result[0]?.chain.chainDefaultCoinDenoms ?? [];

      result = sortByReference(result, denoms, (item, denom) => isEqualsIgnoringCase(item.asset.id, denom));
    }

    return { list: result, visibleCount };
  }, [
    currentCustomCW20TokenIdsSet,
    currentCustomERC20TokenIdsSet,
    currentSelectedChainId,
    customAssetSet,
    customHiddenAssetSet,
    filteredCoinList,
    currentHiddenAssetIdsSet,
    currentVisibleAssetIdsSet,
  ]);
}

export function useProcessedAssets({ baseCoinList, sortOption, currentSelectedChainId, search, debouncedSearch }: UseProcessedAssetsParams) {
  const filteredCoinList = useSortedAndFilteredList(baseCoinList, sortOption, currentSelectedChainId, search, debouncedSearch);

  return useFinalProcessedList(filteredCoinList, currentSelectedChainId);
}
