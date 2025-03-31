import { useMemo } from 'react';

import type { ChainToAccountTypeMap } from '@/types/account';
import { updatePreferAccountType } from '@/utils/zustand/preferAccountType';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from './useAccountAllAssets';
import { useAccountAssets } from './useAccountAssets';
import { useCurrentAccount } from './useCurrentAccount';

export function useCurrentPreferAccountTypes() {
  const { currentAccount } = useCurrentAccount();
  const { preferAccountType } = useExtensionStorageStore((state) => state);

  const { refetch: refetchAccountAssets } = useAccountAssets();
  const { refetch: refetchAccountAllAssets } = useAccountAllAssets();

  const currentPreferAccountType = useMemo(() => preferAccountType[currentAccount.id], [currentAccount.id, preferAccountType]);

  const updateCurrentPreferAccountType = async (preferAccountType: ChainToAccountTypeMap) => {
    await updatePreferAccountType(currentAccount.id, preferAccountType);

    await refetchAccountAssets();
    await refetchAccountAllAssets();
  };

  return { currentPreferAccountType, updateCurrentPreferAccountType };
}
