import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import type { AccountAllAssets } from '@/types/accountAssets';
import type { ExtensionStorage } from '@/types/extension';

import { useCurrentAccount } from './useCurrentAccount';

type UseAccountAllAssets =
  | {
      accountId?: string;
      config?: UseQueryOptions<AccountAllAssets | null>;
    }
  | undefined;

// FIXME 리턴타입을 useAccountAssets와 동일하게 수정필요
export function useAccountAllAssets({ accountId, config }: UseAccountAllAssets = {}) {
  const { currentAccount } = useCurrentAccount();

  const param = accountId || currentAccount.id;

  const fetcher = async () => {
    try {
      const storage = await chrome.storage.local.get<ExtensionStorage>([
        `${param}-balance-cosmos`,
        `${param}-balance-evm`,
        `${param}-balance-aptos`,
        `${param}-balance-sui`,
        `${param}-balance-erc20`,
        `${param}-balance-cw20`,
      ]);

      const cosmosBalances = storage[`${param}-balance-cosmos`];
      const evmBalances = storage[`${param}-balance-evm`];
      const aptosBalances = storage[`${param}-balance-aptos`];
      const suiBalances = storage[`${param}-balance-sui`];
      const erc20Balances = storage[`${param}-balance-erc20`];
      const cw20Balances = storage[`${param}-balance-cw20`];

      return {
        cosmosBalances,
        evmBalances,
        aptosBalances,
        suiBalances,
        erc20Balances,
        cw20Balances,
      };

      // TODO 리턴타입을 useAccountAssets와 동일하게 수정필요
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
    queryKey: ['accountAllAssets', param],
    queryFn: fetcher,
    enabled: !!param,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    ...config,
  });

  return { currentAccountAssets, isLoading, error, refetch };
}
