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
  innerTokenType: 'custom-cw20' | 'custom-erc20' | 'supported-asset' | 'custom-asset';
};

type UseProcessedAssetsParams = {
  baseCoinList: FlatAccountAssets[];
  sortOption: CommonSortKeyType;
  currentSelectedChainId: UniqueChainId | undefined;
  search: string;
  isSearchEmpty: boolean;
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

function resolveAssetId(coin: FlatAccountAssets): string {
  const { asset, chain } = coin;
  if (chain.mainAssetDenom === asset.id || asset.id === NATIVE_EVM_COIN_ADDRESS) return asset.description || '-';
  if (asset.id.length > 15) return shorterAddress(asset.id, 16) || '-';
  return asset.id || '-';
}

function resolveTokenType(
  coinId: UniqueCoinId,
  erc20Set: Set<UniqueCoinId>,
  cw20Set: Set<UniqueCoinId>,
  customAssetSet: Set<UniqueCoinId>,
): ProcessedAsset['innerTokenType'] {
  if (erc20Set.has(coinId)) return 'custom-erc20';
  if (cw20Set.has(coinId)) return 'custom-cw20';
  if (customAssetSet.has(coinId)) return 'custom-asset';
  return 'supported-asset';
}

function useSortedAndFilteredList(
  baseCoinList: FlatAccountAssets[],
  sortOption: CommonSortKeyType,
  currentSelectedChainId: UniqueChainId | undefined,
  search: string,
  isSearchEmpty: boolean,
): AssetWithValue<FlatAccountAssets>[] {
  const pricedAssets = useAssetPricing(baseCoinList);

  const sortedAssets = useMemo(() => sortAssetsByKey(pricedAssets, sortOption), [pricedAssets, sortOption]);

  return useMemo(() => {
    const chainFilteredAssets = getFilteredAssetsByChainId(sortedAssets, currentSelectedChainId);
    return filterAssetsBySearch(chainFilteredAssets, search, isSearchEmpty);
  }, [currentSelectedChainId, isSearchEmpty, search, sortedAssets]);
}

type HiddenStateSnapshot = {
  hiddenAssetIds: Set<UniqueCoinId>;
  visibleAssetIds: Set<UniqueCoinId>;
  hiddenCustomAssetIds: Set<UniqueCoinId>;
};

function useFinalProcessedList(
  filteredCoinList: AssetWithValue<FlatAccountAssets>[],
  currentSelectedChainId: UniqueChainId | undefined,
): { list: ProcessedAsset[]; visibleCount: number } {
  const { currentCustomHiddenAssetIdsSet: customHiddenAssetSet, currentCustomAssetIdsSet: customAssetSet } = useCustomAssets();
  const { currentHiddenAssetIdsSet } = useCurrentHiddenAssetIds();
  const { currentVisibleAssetIdsSet } = useCurrentVisibleAssetIds();
  const { currentCustomERC20TokenIdsSet } = useCurrentCustomERC20Tokens();
  const { currentCustomCW20TokenIdsSet } = useCurrentCustomCW20Tokens();

  const snapshotRef = useRef<HiddenStateSnapshot | null>(null);

  if (snapshotRef.current === null) {
    const hasData = !!(currentHiddenAssetIdsSet?.size || currentVisibleAssetIdsSet?.size || customHiddenAssetSet?.size);
    if (hasData) {
      snapshotRef.current = {
        hiddenAssetIds: new Set(currentHiddenAssetIdsSet ?? []),
        visibleAssetIds: new Set(currentVisibleAssetIdsSet ?? []),
        hiddenCustomAssetIds: new Set(customHiddenAssetSet ?? []),
      };
    }
  }

  return useMemo(() => {
    const snapshot = snapshotRef.current;
    const snapshotHiddenAssetIds = snapshot?.hiddenAssetIds ?? currentHiddenAssetIdsSet;
    const snapshotVisibleAssetIds = snapshot?.visibleAssetIds ?? currentVisibleAssetIdsSet;
    const snapshotCustomHiddenAssetIds = snapshot?.hiddenCustomAssetIds ?? customHiddenAssetSet;

    const visible: ProcessedAsset[] = [];
    const hidden: ProcessedAsset[] = [];
    let visibleCount = 0;

    for (const coin of filteredCoinList) {
      const coinId = coin.uniqueCoinId;
      const isBalanceZero = coin.balance === '0';
      const innerTokenType = resolveTokenType(coinId, currentCustomERC20TokenIdsSet, currentCustomCW20TokenIdsSet, customAssetSet);
      const isCustomToken = innerTokenType === 'custom-erc20' || innerTokenType === 'custom-cw20';

      const isHiddenState = getHiddenState(coinId, isCustomToken, isBalanceZero, currentHiddenAssetIdsSet, customHiddenAssetSet, currentVisibleAssetIdsSet);
      const isSortingHidden = getHiddenState(
        coinId,
        isCustomToken,
        isBalanceZero,
        snapshotHiddenAssetIds,
        snapshotCustomHiddenAssetIds,
        snapshotVisibleAssetIds,
      );

      const processedItem: ProcessedAsset = {
        ...coin,
        isHiddenState,
        resolvedAssetId: resolveAssetId(coin),
        isBalanceZero,
        innerTokenType,
      };

      if (isSortingHidden) {
        hidden.push(processedItem);
      } else {
        visible.push(processedItem);
      }

      if (!isHiddenState) visibleCount++;
    }

    const mergedAssets = [...visible, ...hidden];

    const sortedByDefaultDenom =
      currentSelectedChainId && mergedAssets.length > 0
        ? sortByReference(mergedAssets, mergedAssets[0]?.chain.chainDefaultCoinDenoms ?? [], (item, denom) => isEqualsIgnoringCase(item.asset.id, denom))
        : mergedAssets;

    return { list: sortedByDefaultDenom, visibleCount };
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

export function useProcessedAssets({ baseCoinList, sortOption, currentSelectedChainId, search, isSearchEmpty }: UseProcessedAssetsParams) {
  const filteredCoinList = useSortedAndFilteredList(baseCoinList, sortOption, currentSelectedChainId, search, isSearchEmpty);

  return useFinalProcessedList(filteredCoinList, currentSelectedChainId);
}
