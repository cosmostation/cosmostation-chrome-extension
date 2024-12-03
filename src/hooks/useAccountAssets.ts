import { useQuery } from '@tanstack/react-query';

import { getAccountAssets } from '@/libs/asset';

import { useCurrentAccount } from './useCurrentAccount';

export function useAccountAssets() {
  const { currentAccount } = useCurrentAccount();

  console.log('🚀 ~ useAccountAssets ~ currentAccount:', currentAccount);

  const fetcher = async () => {
    try {
      console.log(currentAccount.id);
      return await getAccountAssets(currentAccount.id);
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
    queryKey: ['accountAssets', currentAccount.id],
    queryFn: fetcher,
    enabled: !!currentAccount.id, // currentAccount가 존재할 때만 실행
    staleTime: 1000 * 60 * 5, // 데이터가 5분 동안 신선하다고 간주
    refetchInterval: 1000 * 60 * 10, // 10분마다 주기적으로 새로 고침
  });

  return { currentAccountAssets, isLoading, error, refetch };
}
