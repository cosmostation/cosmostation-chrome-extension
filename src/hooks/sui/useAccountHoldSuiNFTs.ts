import { getSuiNFTs } from '@/libs/asset';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useCurrentAccount } from '../useCurrentAccount';

type UseAccountHoldSuiNFTsProps =
  | {
      accountId?: string;
      config?: UseFetchConfig;
    }
  | undefined;

export function useAccountHoldSuiNFTs({ accountId, config }: UseAccountHoldSuiNFTsProps = {}) {
  const { currentAccount } = useCurrentAccount();
  const currentAccountId = accountId || currentAccount.id;

  const fetcher = async () => {
    return getSuiNFTs(currentAccountId);
  };

  const { data, isLoading, isFetching, error, refetch } = useFetch({
    queryKey: ['accountSuiNFTs', currentAccountId],
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
