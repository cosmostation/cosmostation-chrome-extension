import { useQuery } from '@tanstack/react-query';

import { sendMessage } from '@/libs/extension';

import { useCurrentAccount } from '../useCurrentAccount';

export function useUpdateBalance() {
  const { currentAccount } = useCurrentAccount();

  // NOTE 스로틀링 추가 필요.

  // Note 원 데이터에서 체인,에셋 데이터로 분리 저장.

  // NOTE 체인, 에셋 / api name, 중복 필터링 로직 필요
  // NOTE 이 함수 자체에 스로틀링 구현 필요.
  const fetcher = async () => {
    await sendMessage({ target: 'SERVICE_WORKER', method: 'updateBalance', params: [currentAccount.id] });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['updateBalance', currentAccount.id],
    enabled: !!currentAccount.id,
    queryFn: fetcher,
    staleTime: 1000 * 14,
    refetchInterval: 1000 * 15,
  });

  return { data, isLoading, error };
}
