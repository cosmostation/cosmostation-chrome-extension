import { useMemo } from 'react';

import type { ChainToAccountTypeMap } from '@/types/account';
import { updatePreferAccountType } from '@/utils/zustand/preferAccountType';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useCurrentAccount } from './useCurrentAccount';

export function useCurrentPreferAccountTypes() {
  const { currentAccount } = useCurrentAccount();
  const { preferAccountType } = useExtensionStorageStore((state) => state);

  const currentPreferAccountType = useMemo(() => preferAccountType[currentAccount.id], [currentAccount.id, preferAccountType]);

  const updateCurrentPreferAccountType = async (preferAccountType: ChainToAccountTypeMap) => {
    await updatePreferAccountType(currentAccount.id, preferAccountType);
  };

  return { currentPreferAccountType, updateCurrentPreferAccountType };
}
