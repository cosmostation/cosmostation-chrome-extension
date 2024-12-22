import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getHiddenAssets } from '@/libs/asset';
import type { AssetId } from '@/types/asset';

import { useCurrentAccount } from './useCurrentAccount';

type UseCurrentHiddenAssetIdsProps =
  | {
      accountId?: string;
      config?: UseQueryOptions<AssetId[] | null>;
    }
  | undefined;

export function useCurrentHiddenAssetIds({ accountId, config }: UseCurrentHiddenAssetIdsProps = {}) {
  const { currentAccount } = useCurrentAccount();

  const param = accountId || currentAccount.id;

  const fetcher = async () => {
    try {
      const hiddenAssetIds = await getHiddenAssets(param);

      return hiddenAssetIds;
    } catch {
      return null;
    }
  };

  // NORW 옵션 수정 필요. 뮤테이트 함수 리턴 필요
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['currentHiddenAssets', param],
    queryFn: fetcher,
    enabled: !!param,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    ...config,
  });

  return { data, isLoading, error, refetch };
}
