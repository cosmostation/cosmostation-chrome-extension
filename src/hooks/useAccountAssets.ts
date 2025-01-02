import { useMemo } from 'react';
import { produce } from 'immer';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getAccountAssets, getAccountCustomAssets } from '@/libs/asset';
import type { AccountAssets, FlatAccountAssets } from '@/types/accountAssets';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useCurrentAccount } from './useCurrentAccount';

type UseAccountAssetsResponse = AccountAssets & {
  flatAccountAssets: FlatAccountAssets[];
};

type UseAccountAssets =
  | {
      accountId?: string;
      isOrign?: boolean;
      config?: UseQueryOptions<AccountAssets | null>;
    }
  | undefined;

export function useAccountAssets({ accountId, isOrign = false, config }: UseAccountAssets = {}) {
  const { currentAccount } = useCurrentAccount();
  const { preferAccountType } = useExtensionStorageStore((state) => state);

  const param = accountId || currentAccount.id;
  const accountType = preferAccountType[param];

  const fetcher = async () => {
    try {
      // NOTE 스토리지 갱신 로직 이 자리에 추가. -> 갱신 생애주기가 살아있을때만 갱신.
      // await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [param] });
      const accountAssets = await getAccountAssets(param);
      const accountCustomAssets = await getAccountCustomAssets(param);
      return {
        ...accountAssets,
        ...accountCustomAssets,
      };
    } catch {
      return null;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['accountAssets', param],
    queryFn: fetcher,
    enabled: !!param,
    staleTime: 1000 * 14,
    refetchInterval: 1000 * 15,
    ...config,
  });

  const returnData = useMemo(() => {
    if (!data) return null;

    if (isOrign) {
      const flatAccountAssets = Object.values(data).flat();

      const returnData: UseAccountAssetsResponse = {
        ...data,
        flatAccountAssets: flatAccountAssets,
      };
      return returnData;
    }

    const filteredCosmos = data.cosmosAccountAssets
      .filter((item) => {
        const selectedChainAccountType = accountType[item.chain.id];

        if (selectedChainAccountType) {
          return (
            selectedChainAccountType.hdPath === item.address.accountType.hdPath &&
            selectedChainAccountType.pubKeyType === item.address.accountType.pubKeyType &&
            selectedChainAccountType.pubkeyStyle === item.address.accountType.pubkeyStyle
          );
        }
        return true;
      })
      // NOTE 60패스 evm, cosmos 중복 에셋 코스모스 쪽 리스트에서 필터링.
      .filter((item) => {
        const isDuplicatedEVMAsset = item.chain.chainType === 'cosmos' && item.chain.isEvm && item.chain.mainAssetDenom === item.asset.id;
        if (isDuplicatedEVMAsset) {
          return false;
        }

        return true;
      });

    const filteredCW20 = data.cw20AccountAssets.filter((item) => {
      const selectedChainAccountType = accountType[item.chain.id];

      if (selectedChainAccountType) {
        return (
          selectedChainAccountType.hdPath === item.address.accountType.hdPath &&
          selectedChainAccountType.pubKeyType === item.address.accountType.pubKeyType &&
          selectedChainAccountType.pubkeyStyle === item.address.accountType.pubkeyStyle
        );
      }
      return true;
    });

    const filteredAccountAssets = produce(data, (draft) => {
      draft.cosmosAccountAssets = filteredCosmos;
      draft.cw20AccountAssets = filteredCW20;
    });

    const flatAccountAssets = Object.values(filteredAccountAssets).flat();

    const returnData: UseAccountAssetsResponse = {
      ...filteredAccountAssets,
      flatAccountAssets: flatAccountAssets,
    };

    return returnData;
  }, [accountType, data, isOrign]);

  return { data: returnData, isLoading, error, refetch };
}

// NOTE 최상위에서 훅이 콜 안되어도 갱신될 수 있도록 하는 컴포넌트(주기적으로 useAccountAssets를 호출하는). 뮤테이트.
