import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useCurrentAccount } from './useCurrentAccount';

interface UseRefreshAccountAllAssetsProps {
  accountId?: string;
}
export function useRefreshAccountAllAssets(props?: UseRefreshAccountAllAssetsProps) {
  const { accountId } = props ?? {};

  const queryClient = useQueryClient();
  const { currentAccount } = useCurrentAccount();

  const currentAccountId = useMemo(() => accountId || currentAccount.id, [accountId, currentAccount.id]);

  const refreshAssets = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['accountAllAssets', currentAccountId],
    });
  }, [currentAccountId, queryClient]);

  return { refreshAssets };
}
