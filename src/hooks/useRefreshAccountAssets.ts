import { useMemo } from 'react';

import { useAccountAllAssets } from './useAccountAllAssets';
import { useAccountAssets } from './useAccountAssets';
import { useAccountCustomAssets } from './useAccountCustomAssets';

export function useRefreshAccountAssets() {
  const { refetch: refetchAccountAssets, isLoading: isLoadingAccountAssets } = useAccountAssets();
  const { refetch: refetchAccountAllAssets, isLoading: isLoadingAccountAllAssets } = useAccountAllAssets();
  const { refetch: refetchAccountCustomAssets, isLoading: isLoadingAccountCustomAssets } = useAccountCustomAssets();

  const refreshAccountAssets = async () => {
    await refetchAccountAssets();
    await refetchAccountAllAssets();
    await refetchAccountCustomAssets();
  };
  const isLoading = useMemo(
    () => isLoadingAccountAssets || isLoadingAccountAllAssets || isLoadingAccountCustomAssets,
    [isLoadingAccountAllAssets, isLoadingAccountAssets, isLoadingAccountCustomAssets],
  );

  return { refreshAccountAssets, isLoading };
}
