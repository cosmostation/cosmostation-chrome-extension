import { useMemo } from 'react';
import { produce } from 'immer';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getAccountAssets, getAccountCustomAssets } from '@/libs/asset';
import type { AccountAssets as AccountAllAssets, AllCosmosAccountAssets, AllEVMAccountAssets, FlatAccountAssets } from '@/types/accountAssets';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useCurrentAccount } from './useCurrentAccount';

type UseAccountAssetsResponse = AccountAllAssets & {
  flatAccountAssets: FlatAccountAssets[];
  allCosmosAccountAssets: AllCosmosAccountAssets[];
  allEVMAccountAssets: AllEVMAccountAssets[];
};

type UseAccountAllAssets =
  | {
      accountId?: string;
      filterByPreferAccountType?: boolean;
      disableHiddenFilter?: boolean;
      disableBalanceFilter?: boolean;
      config?: UseQueryOptions<AccountAllAssets | null>;
    }
  | undefined;

export function useAccountAllAssets({
  accountId,
  filterByPreferAccountType = false,
  disableHiddenFilter = true,
  disableBalanceFilter = true,
  config,
}: UseAccountAllAssets = {}) {
  const { currentAccount } = useCurrentAccount();
  const preferAccountType = useExtensionStorageStore((state) => state.preferAccountType);

  const param = accountId || currentAccount.id;
  const accountType = preferAccountType[param];

  const fetcher = async () => {
    try {
      const accountAssets = await getAccountAssets(param, { disableFilterHidden: disableHiddenFilter, disableBalanceFilter: disableBalanceFilter });
      const accountCustomAssets = await getAccountCustomAssets(param, { disableFilterHidden: disableHiddenFilter, disableBalanceFilter: disableBalanceFilter });
      return {
        ...accountAssets,
        ...accountCustomAssets,
      };
    } catch {
      return null;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['accountAllAssets', param, disableHiddenFilter, disableBalanceFilter],
    queryFn: fetcher,
    enabled: !!param,
    staleTime: 1000 * 14,
    refetchInterval: 1000 * 15,
    ...config,
  });

  const returnData = useMemo(() => {
    if (!data) return null;

    if (filterByPreferAccountType) {
      const filteredCosmos = data.cosmosAccountAssets
        .filter((item) => {
          const selectedChainAccountType = accountType[item.chain.id];

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
          const isDuplicatedEVMAsset =
            item.chain.chainType === 'cosmos' &&
            item.chain.isEvm &&
            item.chain.mainAssetDenom === item.asset.id &&
            data.evmAccountAssets.some((evmAsset) => {
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

      const filteredCW20 = data.cw20AccountAssets.filter((item) => {
        const selectedChainAccountType = accountType[item.chain.id];

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

      const filteredEVM = data.evmAccountAssets.filter((item) => {
        const selectedChainAccountType = accountType[item.chain.id];

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

      const filteredERC20Assets = data.erc20AccountAssets.filter((item) => {
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

      const filteredBitcoin = data.bitcoinAccountAssets.filter((item) => {
        const selectedChainAccountType = accountType[item.chain.id];

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

      const filteredAccountAssets = produce(data, (draft) => {
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
        allEVMAccountAssets: [
          ...filteredAccountAssets.evmAccountAssets,
          ...filteredAccountAssets.evmAccountCustomAssets,
          ...filteredAccountAssets.erc20AccountAssets,
          ...filteredAccountAssets.customErc20AccountAssets,
        ],
      };

      return returnData;
    } else {
      const flatAccountAssets = Object.values(data).flat();

      const returnData: UseAccountAssetsResponse = {
        ...data,
        flatAccountAssets: flatAccountAssets,
        allCosmosAccountAssets: [...data.cosmosAccountAssets, ...data.cosmosAccountCustomAssets, ...data.cw20AccountAssets, ...data.customCw20AccountAssets],
        allEVMAccountAssets: [...data.evmAccountAssets, ...data.evmAccountCustomAssets, ...data.erc20AccountAssets, ...data.customErc20AccountAssets],
      };

      return returnData;
    }
  }, [accountType, data, filterByPreferAccountType]);

  return { data: returnData, isLoading, error, refetch };
}
