import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getAccountAssets } from '@/libs/asset';
import { sendMessage } from '@/libs/extension';
import type { AccountAssets } from '@/types/accountAssets';

import { useCurrentAccount } from './useCurrentAccount';

type UseAccountAssets =
  | {
      accountId?: string;
      config?: UseQueryOptions<AccountAssets | null>;
    }
  | undefined;

export function useAccountAssets({ accountId, config }: UseAccountAssets = {}) {
  const { currentAccount } = useCurrentAccount();

  const param = accountId || currentAccount.id;

  const fetcher = async () => {
    try {
      // NOTE 스토리지 갱신 로직 이 자리에 추가. -> 갱신 생애주기가 살아있을때만 갱신.
      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [param] });
      return await getAccountAssets(param);
    } catch {
      return null;
    }
  };

  const {
    data: currentAccountAssets,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['accountAssets', param],
    queryFn: fetcher,
    enabled: !!param,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    ...config,
  });

  return { currentAccountAssets, isLoading, error, refetch };
}

// NOTE 최상위에서 훅이 콜 안되어도 갱신될 수 있도록 하는 컴포넌트(주기적으로 useAccountAssets를 호출하는). 뮤테이트.
