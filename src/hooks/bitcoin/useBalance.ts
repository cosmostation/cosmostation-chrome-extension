import { getExtensionLocalStorage } from '@/utils/storage';

import type { UseFetchConfig } from '../common/useFetch';
import { useFetch } from '../common/useFetch';
import { useCurrentAccount } from '../useCurrentAccount';

type UseBalanceProps = {
  accountId?: string;
  config?: UseFetchConfig;
};

export function useBalance({ accountId, config }: UseBalanceProps = {}) {
  const { currentAccount } = useCurrentAccount();

  const param = accountId || currentAccount.id;

  const fetcher = () => getExtensionLocalStorage(`${param}-balance-bitcoin`);

  const { data, isLoading, error } = useFetch({
    queryKey: ['bitcoinBalance', accountId],
    fetchFunction: fetcher,
    config: {
      enabled: !!param,
      refetchInterval: 1000 * 15,
      ...config,
    },
  });

  return { data, isLoading, error };
}
