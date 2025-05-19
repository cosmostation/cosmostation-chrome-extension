import { getIotaNFTs } from '@/libs/asset';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useCurrentAccount } from '../useCurrentAccount';

type UseAccountHoldIotaNFTsProps =
  | {
      accountId?: string;
      config?: UseFetchConfig;
    }
  | undefined;

export function useAccountHoldIotaNFTs({ accountId, config }: UseAccountHoldIotaNFTsProps = {}) {
  const { currentAccount } = useCurrentAccount();
  const currentAccountId = accountId || currentAccount.id;

  const fetcher = async () => {
    return getIotaNFTs(currentAccountId);
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['accountIotaNFTs', currentAccountId],
    fetchFunction: () => fetcher(),
    config: {
      enabled: !!currentAccountId,
      staleTime: 1000 * 60 * 1,
      refetchInterval: false,
      ...config,
    },
  });

  return { data, isLoading, isFetching, error, refetch };
}
