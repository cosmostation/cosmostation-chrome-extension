import { useMemo } from 'react';
import { produce } from 'immer';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getAccountAssets, getAccountCustomAssets } from '@/libs/asset';
import type { AccountAddress } from '@/types/account';
import type { AccountAssets as AccountAllAssets, AllCosmosAccountAssets, AllEVMAccountAssets, FlatAccountAssets } from '@/types/accountAssets';
import type { AssetId } from '@/types/asset';
import { gt } from '@/utils/numbers';
import { isEqualsIgnoringCase } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useCurrentAccount } from './useCurrentAccount';

export type UseAccountAssetsResponse = AccountAllAssets & {
  flatAccountAssets: FlatAccountAssets[];
  allCosmosAccountAssets: AllCosmosAccountAssets[];
  allCosmosAccountAssetsFiltered: AllCosmosAccountAssets[];
  allEVMAccountAssets: AllEVMAccountAssets[];
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

export function useAccountAllAssets({
  accountId,
  filterByPreferAccountType = false,
  disableHiddenFilter = true,
  disableBalanceFilter = true,
  disableDupeEthermint = false,
  config,
}: UseAccountAllAssets = {}) {
  const { currentAccount } = useCurrentAccount();
  const extensionStorageState = useExtensionStorageStore((state) => state);

  const param = useMemo(() => accountId || currentAccount.id, [accountId, currentAccount.id]);
  const accountType = useMemo(() => extensionStorageState.preferAccountType[param], [extensionStorageState.preferAccountType, param]);

  const fetcher = async () => {
    try {
      const accountAssets = await getAccountAssets(param, { disableFilterHidden: true, disableBalanceFilter: true });
      const accountCustomAssets = await getAccountCustomAssets(param, { disableFilterHidden: true, disableBalanceFilter: true });
      return {
        ...accountAssets,
        ...accountCustomAssets,
      };
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

  const hiddenAssetIds = useMemo(() => extensionStorageState[`${param}-hidden-assetIds`] || [], [extensionStorageState, param]);
  const hiddenCustomAssetIds = useMemo(() => extensionStorageState['customHiddenAssetIds'] || [], [extensionStorageState]);
  const visibleAssetIds = useMemo(() => extensionStorageState[`${param}-visible-assetIds`] || [], [extensionStorageState, param]);

  const bitcoinBalanceInfo = useMemo(() => extensionStorageState[`${param}-balance-bitcoin`] || [], [extensionStorageState, param]);

  const filteredByVisibleList = useMemo(() => {
    if (!data) return null;

    const shouldShowAsset = (asset: AssetId, balance: string, address: AccountAddress) => {
      const isVisible = visibleAssetIds.some(
        (assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType,
      );

      if (isVisible) return true;

      const isHidden = disableHiddenFilter
        ? false
        : hiddenAssetIds.some((assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType) ||
          hiddenCustomAssetIds.some((assetId) => assetId.chainId === asset.chainId && assetId.id === asset.id && assetId.chainType === asset.chainType);
      if (isHidden) return false;

      const isBalanceGreaterThanZero = (() => {
        if (asset.chainType === 'bitcoin') {
          const balanceInfo = bitcoinBalanceInfo?.find(
            (balance) =>
              isEqualsIgnoringCase(balance.address, address.address) && balance.chainId === address.chainId && balance.chainType === address.chainType,
          );

          const pendingFundedAmount = balanceInfo?.balance.mempoolStats?.funded_txo_sum || '0';
          const isPendingReceiveBalanceGreaterThanZero = gt(pendingFundedAmount, '0');

          const isBalanceGreaterThanZero = gt(balance, '0');

          return isBalanceGreaterThanZero || isPendingReceiveBalanceGreaterThanZero;
        } else {
          return gt(balance, '0');
        }
      })();

      return disableBalanceFilter ? true : isBalanceGreaterThanZero;
    };

    const filterAssetList = <T extends { asset: AssetId; balance: string; address: AccountAddress }>(list: T[]): T[] =>
      list.filter(({ asset, balance, address }) => shouldShowAsset(asset, balance, address));

    return {
      cosmosAccountAssets: filterAssetList(data.cosmosAccountAssets),
      cosmosAccountCustomAssets: filterAssetList(data.cosmosAccountCustomAssets),
      evmAccountAssets: filterAssetList(data.evmAccountAssets),
      evmAccountCustomAssets: filterAssetList(data.evmAccountCustomAssets),
      aptosAccountAssets: filterAssetList(data.aptosAccountAssets),
      suiAccountAssets: filterAssetList(data.suiAccountAssets),
      cw20AccountAssets: filterAssetList(data.cw20AccountAssets),
      erc20AccountAssets: filterAssetList(data.erc20AccountAssets),
      customErc20AccountAssets: data.customErc20AccountAssets,
      customCw20AccountAssets: data.customCw20AccountAssets,
      bitcoinAccountAssets: filterAssetList(data.bitcoinAccountAssets),
      iotaAccountAssets: filterAssetList(data.iotaAccountAssets),
    };
  }, [bitcoinBalanceInfo, data, disableBalanceFilter, disableHiddenFilter, hiddenAssetIds, hiddenCustomAssetIds, visibleAssetIds]);

  const returnData = useMemo(() => {
    if (!filteredByVisibleList) return null;

    if (filterByPreferAccountType) {
      const filteredCosmos = filteredByVisibleList.cosmosAccountAssets
        .filter((item) => {
          const selectedChainAccountType = accountType?.[item.chain.id];

          if (selectedChainAccountType) {
            const isSamePubkeyType = (() => {
              if (selectedChainAccountType.pubkeyType && item.address.accountType.pubkeyType) {
                return selectedChainAccountType.pubkeyType === item.address.accountType.pubkeyType;
              }
              return true;
            })();
            return (
              selectedChainAccountType.hdPath === item.address.accountType.hdPath &&
              selectedChainAccountType.pubkeyStyle === item.address.accountType.pubkeyStyle &&
              isSamePubkeyType
            );
          }
          return true;
        })
        .filter((item) => {
          if (disableDupeEthermint) {
            return true;
          }

          const isDuplicatedEVMAsset =
            item.chain.chainType === 'cosmos' &&
            item.chain.isEvm &&
            item.chain.mainAssetDenom === item.asset.id &&
            filteredByVisibleList.evmAccountAssets.some((evmAsset) => {
              const isSameAssetChain = evmAsset.chain.id === item.chain.id;

              const { hdPath, pubkeyStyle, pubkeyType } = evmAsset.address.accountType;
              const { hdPath: compareHdPath, pubkeyStyle: comparePubkeyStyle, pubkeyType: comparePubkeyType } = item.address.accountType;
              const isSameAccountType = hdPath === compareHdPath && pubkeyStyle === comparePubkeyStyle && pubkeyType === comparePubkeyType;

              return isSameAssetChain && isSameAccountType;
            });
          if (isDuplicatedEVMAsset) {
            return false;
          }

          return true;
        });

      const cosmosAssetsWithPreferredAccountType = filteredCosmos.map((item) => {
        const selectedChainAccountType = accountType?.[item.chain.id];

        if (selectedChainAccountType) {
          return produce(item, (draft) => {
            draft.chain.accountTypes = draft.chain.accountTypes.filter(
              (accountType) => accountType.pubkeyStyle === selectedChainAccountType.pubkeyStyle && accountType.hdPath === selectedChainAccountType.hdPath,
            );
          });
        }

        return item;
      });

      const filteredCW20 = filteredByVisibleList.cw20AccountAssets.filter((item) => {
        const selectedChainAccountType = accountType?.[item.chain.id];

        if (selectedChainAccountType) {
          const isSamePubkeyType = (() => {
            if (selectedChainAccountType.pubkeyType && item.address.accountType.pubkeyType) {
              return selectedChainAccountType.pubkeyType === item.address.accountType.pubkeyType;
            }
            return true;
          })();

          return (
            selectedChainAccountType.hdPath === item.address.accountType.hdPath &&
            selectedChainAccountType.pubkeyStyle === item.address.accountType.pubkeyStyle &&
            isSamePubkeyType
          );
        }
        return true;
      });

      const cw20AssetsWithPreferredAccountType = filteredCW20.map((item) => {
        const selectedChainAccountType = accountType?.[item.chain.id];

        if (selectedChainAccountType) {
          return produce(item, (draft) => {
            draft.chain.accountTypes = draft.chain.accountTypes.filter(
              (accountType) => accountType.pubkeyStyle === selectedChainAccountType.pubkeyStyle && accountType.hdPath === selectedChainAccountType.hdPath,
            );
          });
        }

        return item;
      });

      const filteredEVM = filteredByVisibleList.evmAccountAssets.filter((item) => {
        const selectedChainAccountType = accountType?.[item.chain.id];

        if (selectedChainAccountType) {
          const isSamePubkeyType = (() => {
            if (selectedChainAccountType.pubkeyType && item.address.accountType.pubkeyType) {
              return selectedChainAccountType.pubkeyType === item.address.accountType.pubkeyType;
            }
            return true;
          })();

          return (
            selectedChainAccountType.hdPath === item.address.accountType.hdPath &&
            selectedChainAccountType.pubkeyStyle === item.address.accountType.pubkeyStyle &&
            isSamePubkeyType
          );
        }
        return true;
      });

      const filteredERC20Assets = filteredByVisibleList.erc20AccountAssets.filter((item) => {
        const selectedChainAccountType = accountType?.[item.chain.id];

        if (selectedChainAccountType) {
          const isSamePubkeyType = (() => {
            if (selectedChainAccountType.pubkeyType && item.address.accountType.pubkeyType) {
              return selectedChainAccountType.pubkeyType === item.address.accountType.pubkeyType;
            }
            return true;
          })();
          return (
            selectedChainAccountType.hdPath === item.address.accountType.hdPath &&
            selectedChainAccountType.pubkeyStyle === item.address.accountType.pubkeyStyle &&
            isSamePubkeyType
          );
        }
        return true;
      });

      const filteredBitcoin = filteredByVisibleList.bitcoinAccountAssets.filter((item) => {
        const selectedChainAccountType = accountType?.[item.chain.id];

        if (selectedChainAccountType) {
          const isSamePubkeyType = (() => {
            if (selectedChainAccountType.pubkeyType && item.address.accountType.pubkeyType) {
              return selectedChainAccountType.pubkeyType === item.address.accountType.pubkeyType;
            }
            return true;
          })();

          return (
            selectedChainAccountType.hdPath === item.address.accountType.hdPath &&
            selectedChainAccountType.pubkeyStyle === item.address.accountType.pubkeyStyle &&
            isSamePubkeyType
          );
        }
        return true;
      });

      const filteredAccountAssets = produce(filteredByVisibleList, (draft) => {
        draft.cosmosAccountAssets = filteredCosmos;
        draft.cw20AccountAssets = filteredCW20;
        draft.evmAccountAssets = filteredEVM;
        draft.erc20AccountAssets = filteredERC20Assets;
        draft.bitcoinAccountAssets = filteredBitcoin;
      });

      const flatAccountAssets = Object.values(filteredAccountAssets).flat() as FlatAccountAssets[];

      const returnData: UseAccountAssetsResponse = {
        ...filteredAccountAssets,
        flatAccountAssets: flatAccountAssets,
        allCosmosAccountAssets: [
          ...filteredAccountAssets.cosmosAccountAssets,
          ...filteredAccountAssets.cosmosAccountCustomAssets,
          ...filteredAccountAssets.cw20AccountAssets,
          ...filteredAccountAssets.customCw20AccountAssets,
        ],
        allCosmosAccountAssetsFiltered: [
          ...cosmosAssetsWithPreferredAccountType,
          ...filteredAccountAssets.cosmosAccountCustomAssets,
          ...cw20AssetsWithPreferredAccountType,
          ...filteredAccountAssets.customCw20AccountAssets,
        ],
        allEVMAccountAssets: [
          ...filteredAccountAssets.evmAccountAssets,
          ...filteredAccountAssets.evmAccountCustomAssets,
          ...filteredAccountAssets.erc20AccountAssets,
          ...filteredAccountAssets.customErc20AccountAssets,
        ],
      };

      return returnData;
    } else {
      const flatAccountAssets = Object.values(filteredByVisibleList).flat();

      const cosmosAccountAssets = [
        ...filteredByVisibleList.cosmosAccountAssets,
        ...filteredByVisibleList.cosmosAccountCustomAssets,
        ...filteredByVisibleList.cw20AccountAssets,
        ...filteredByVisibleList.customCw20AccountAssets,
      ];

      const returnData: UseAccountAssetsResponse = {
        ...filteredByVisibleList,
        flatAccountAssets: flatAccountAssets,
        allCosmosAccountAssets: cosmosAccountAssets,
        allCosmosAccountAssetsFiltered: cosmosAccountAssets,
        allEVMAccountAssets: [
          ...filteredByVisibleList.evmAccountAssets,
          ...filteredByVisibleList.evmAccountCustomAssets,
          ...filteredByVisibleList.erc20AccountAssets,
          ...filteredByVisibleList.customErc20AccountAssets,
        ],
      };

      return returnData;
    }
  }, [accountType, disableDupeEthermint, filterByPreferAccountType, filteredByVisibleList]);

  return { data: returnData, isLoading, isFetching, error, refetch };
}
