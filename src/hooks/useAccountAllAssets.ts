import { useMemo } from 'react';
import { produce } from 'immer';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getAccountCustomAssets } from '@/libs/asset/coin/custom/accountAsset';
import { getAccountAssets } from '@/libs/asset/coin/default/accountAsset';
import type { ChainToAccountTypeMap } from '@/types/account';
import type {
  AccountAssets as AccountAllAssets,
  AllCosmosAccountAssets,
  AllEVMAccountAssets,
  AllGnoAccountAssets,
  AllSolanaAccountAssets,
  FlatAccountAssets,
} from '@/types/accountAssets';
import type { UniqueCoinId } from '@/types/asset';
import { gt } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAssetIdsSet } from './queries/useAccountAssetIdsQuery';
import { useCurrentAccount } from './useCurrentAccount';
import { useCustomAssets } from './useCustomAssets';

export type UseAccountAssetsResponse = AccountAllAssets & {
  flatAccountAssets: FlatAccountAssets[];
  allCosmosAccountAssets: AllCosmosAccountAssets[];
  allCosmosAccountAssetsFiltered: AllCosmosAccountAssets[];
  allEVMAccountAssets: AllEVMAccountAssets[];
  allSolanaAccountAssets: AllSolanaAccountAssets[];
  allGnoAccountAssets: AllGnoAccountAssets[];
};

type UseAccountAllAssets =
  | {
      accountId?: string;
      filterByPreferAccountType?: boolean;
      disableHiddenFilter?: boolean;
      disableBalanceFilter?: boolean;
      disableDupeEthermint?: boolean;
      config?: UseQueryOptions<AccountAllAssets | null>;
    }
  | undefined;

function filterByChainAccountType<T extends FlatAccountAssets>(items: T[], accountTypeMap: ChainToAccountTypeMap | undefined): T[] {
  if (!accountTypeMap) return items;

  return items.filter((item) => {
    const selected = accountTypeMap[item.chain.id];
    if (!selected) return true;

    const isSamePubkeyType = selected.pubkeyType && item.address.accountType.pubkeyType ? selected.pubkeyType === item.address.accountType.pubkeyType : true;

    return selected.hdPath === item.address.accountType.hdPath && selected.pubkeyStyle === item.address.accountType.pubkeyStyle && isSamePubkeyType;
  });
}

function narrowChainAccountTypes<T extends FlatAccountAssets>(items: T[], accountTypeMap: ChainToAccountTypeMap | undefined): T[] {
  if (!accountTypeMap) return items;

  return items.map((item) => {
    const selected = accountTypeMap[item.chain.id];
    if (!selected) return item;

    return produce(item, (draft) => {
      draft.chain.accountTypes = draft.chain.accountTypes.filter((origin) => origin.pubkeyStyle === selected.pubkeyStyle && origin.hdPath === selected.hdPath);
    });
  });
}

function filterDuplicatedEthermintAssets<T extends FlatAccountAssets>(cosmosItems: T[], evmItems: FlatAccountAssets[] | undefined): T[] {
  if (!evmItems?.length) return cosmosItems;

  return cosmosItems.filter((item) => {
    if (item.chain.chainType !== 'cosmos' || !item.chain.isEvm || item.chain.mainAssetDenom !== item.asset.id) return true;

    return !evmItems.some((evmAsset) => {
      if (evmAsset.chain.id !== item.chain.id) return false;

      const { hdPath, pubkeyStyle, pubkeyType } = evmAsset.address.accountType;
      const { hdPath: compareHdPath, pubkeyStyle: comparePubkeyStyle, pubkeyType: comparePubkeyType } = item.address.accountType;

      return hdPath === compareHdPath && pubkeyStyle === comparePubkeyStyle && pubkeyType === comparePubkeyType;
    });
  });
}

export function useAccountAllAssets({
  accountId,
  filterByPreferAccountType = false,
  disableHiddenFilter = true,
  disableBalanceFilter = true,
  disableDupeEthermint = false,
  config,
}: UseAccountAllAssets = {}) {
  const { currentAccount } = useCurrentAccount();
  const { currentCustomHiddenAssetIdsSet: hiddenCustom } = useCustomAssets();
  const param = useMemo(() => accountId || currentAccount.id, [accountId, currentAccount.id]);

  const preferAccountType = useExtensionStorageStore((state) => state.preferAccountType);
  const accountType = useMemo(() => preferAccountType[param], [param, preferAccountType]);

  const { data: assetIds } = useAccountAssetIdsSet(param);

  const fetcher = async () => {
    try {
      const opts = { disableFilterHidden: true, disableBalanceFilter: true };
      const [accountAssets, accountCustomAssets] = await Promise.all([getAccountAssets(param, opts), getAccountCustomAssets(param, opts)]);
      return { ...accountAssets, ...accountCustomAssets };
    } catch {
      return null;
    }
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['accountAllAssets', param],
    queryFn: fetcher,
    enabled: !!param,
    staleTime: 1000 * 60 * 2,
    ...config,
  });

  const filteredByVisibleList = useMemo(() => {
    if (!data) return null;

    const { hiddenAssetSet: hidden, visibleAssetSet: visible } = assetIds || {};

    const shouldShowAsset = (uniqueCoinId: UniqueCoinId, balance: string) => {
      if (visible?.has(uniqueCoinId)) return true;

      if (!disableHiddenFilter && (hidden?.has(uniqueCoinId) || hiddenCustom.has(uniqueCoinId))) return false;

      return disableBalanceFilter || gt(balance, '0');
    };

    const filterVisible = <T extends { uniqueCoinId: UniqueCoinId; balance: string }>(list: T[]): T[] =>
      list.filter(({ uniqueCoinId, balance }) => shouldShowAsset(uniqueCoinId, balance));

    return {
      cosmosAccountAssets: filterVisible(data.cosmosAccountAssets),
      cosmosAccountCustomAssets: filterVisible(data.cosmosAccountCustomAssets),
      evmAccountAssets: filterVisible(data.evmAccountAssets),
      evmAccountCustomAssets: filterVisible(data.evmAccountCustomAssets),
      aptosAccountAssets: filterVisible(data.aptosAccountAssets),
      suiAccountAssets: filterVisible(data.suiAccountAssets),
      cw20AccountAssets: filterVisible(data.cw20AccountAssets),
      erc20AccountAssets: filterVisible(data.erc20AccountAssets),
      customErc20AccountAssets: data.customErc20AccountAssets,
      customCw20AccountAssets: data.customCw20AccountAssets,
      bitcoinAccountAssets: filterVisible(data.bitcoinAccountAssets),
      iotaAccountAssets: filterVisible(data.iotaAccountAssets),
      solanaAccountAssets: filterVisible(data.solanaAccountAssets),
      spltokenAccountAssets: filterVisible(data.spltokenAccountAssets),
      gnoAccountAssets: filterVisible(data.gnoAccountAssets),
      grc20AccountAssets: filterVisible(data.grc20AccountAssets),
    };
  }, [assetIds, data, disableBalanceFilter, disableHiddenFilter, hiddenCustom]);

  const returnData = useMemo(() => {
    if (!filteredByVisibleList) return null;

    const isAccountTypeFilterActive = filterByPreferAccountType && !!accountType;

    const cosmosAccountAssets = isAccountTypeFilterActive
      ? filterDuplicatedEthermintAssets(
          filterByChainAccountType(filteredByVisibleList.cosmosAccountAssets, accountType),
          disableDupeEthermint ? undefined : data?.evmAccountAssets,
        )
      : filteredByVisibleList.cosmosAccountAssets;

    const cw20AccountAssets = isAccountTypeFilterActive
      ? filterByChainAccountType(filteredByVisibleList.cw20AccountAssets, accountType)
      : filteredByVisibleList.cw20AccountAssets;

    const evmAccountAssets = isAccountTypeFilterActive
      ? filterByChainAccountType(filteredByVisibleList.evmAccountAssets, accountType)
      : filteredByVisibleList.evmAccountAssets;

    const erc20AccountAssets = isAccountTypeFilterActive
      ? filterByChainAccountType(filteredByVisibleList.erc20AccountAssets, accountType)
      : filteredByVisibleList.erc20AccountAssets;

    const bitcoinAccountAssets = isAccountTypeFilterActive
      ? filterByChainAccountType(filteredByVisibleList.bitcoinAccountAssets, accountType)
      : filteredByVisibleList.bitcoinAccountAssets;

    const { cosmosAccountCustomAssets, customCw20AccountAssets, evmAccountCustomAssets, customErc20AccountAssets } = filteredByVisibleList;

    const allCosmosAccountAssets: AllCosmosAccountAssets[] = [
      ...cosmosAccountAssets,
      ...cosmosAccountCustomAssets,
      ...cw20AccountAssets,
      ...customCw20AccountAssets,
    ];

    const allCosmosAccountAssetsFiltered: AllCosmosAccountAssets[] = isAccountTypeFilterActive
      ? [
          ...narrowChainAccountTypes(cosmosAccountAssets, accountType),
          ...cosmosAccountCustomAssets,
          ...narrowChainAccountTypes(cw20AccountAssets, accountType),
          ...customCw20AccountAssets,
        ]
      : allCosmosAccountAssets;

    const assets = {
      ...filteredByVisibleList,
      cosmosAccountAssets,
      cw20AccountAssets,
      evmAccountAssets,
      erc20AccountAssets,
      bitcoinAccountAssets,
    };

    return {
      ...assets,
      flatAccountAssets: Object.values(assets).flat() as FlatAccountAssets[],
      allCosmosAccountAssets,
      allCosmosAccountAssetsFiltered,
      allEVMAccountAssets: [...evmAccountAssets, ...evmAccountCustomAssets, ...erc20AccountAssets, ...customErc20AccountAssets],
      allSolanaAccountAssets: [...filteredByVisibleList.solanaAccountAssets, ...filteredByVisibleList.spltokenAccountAssets],
      allGnoAccountAssets: [...filteredByVisibleList.gnoAccountAssets, ...filteredByVisibleList.grc20AccountAssets],
    } satisfies UseAccountAssetsResponse;
  }, [accountType, data, disableDupeEthermint, filterByPreferAccountType, filteredByVisibleList]);

  return { data: returnData, isLoading, isFetching, error, refetch };
}
