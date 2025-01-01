import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getAccountCustomAssets } from '@/libs/asset';
import type { AccountCustomAssets, FlatAccountCustomAssets } from '@/types/accountAssets';

import { useCurrentAccount } from './useCurrentAccount';

type UseAccountCustomAssetsResponse = AccountCustomAssets & {
  flatAccountCustomAssets: FlatAccountCustomAssets[];
};

type UseAccountCustomAssetsProps =
  | {
      accountId?: string;
      config?: UseQueryOptions<UseAccountCustomAssetsResponse | null>;
    }
  | undefined;

export function useAccountCustomAssets({ accountId, config }: UseAccountCustomAssetsProps = {}) {
  const { currentAccount } = useCurrentAccount();

  const param = accountId || currentAccount.id;

  const fetcher = async () => {
    try {
      const accountCustomAssets = await getAccountCustomAssets(param);

      const flatAccountCustomAssets = Object.values(accountCustomAssets).flat();

      const returnData: UseAccountCustomAssetsResponse = {
        ...accountCustomAssets,
        flatAccountCustomAssets,
      };

      return returnData;
    } catch {
      return null;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['accountCustomAssets', param],
    queryFn: fetcher,
    enabled: !!param,
    staleTime: 1000 * 14,
    refetchInterval: 1000 * 15,
    ...config,
  });

  return { data, isLoading, error, refetch };
}
