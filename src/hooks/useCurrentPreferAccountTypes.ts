import type { ChainToAccountTypeMap } from '@/types/account';
import { updatePreferAccountType } from '@/utils/zustand/preferAccountType';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useAccountAllAssets } from './useAccountAllAssets';
import { useAccountAssets } from './useAccountAssets';
import { useCurrentAccount } from './useCurrentAccount';
import { useGroupAccountAssets } from './useGroupAccountAssets';

export function useCurrentPreferAccountTypes() {
  const { currentAccount } = useCurrentAccount();
  const { preferAccountType } = useExtensionStorageStore((state) => state);

  const { refetch: refetchAccountAssets } = useAccountAssets();
  const { refetch: refetchAccountAllAssets } = useAccountAllAssets();
  const { refetch: refetchGroupAssets } = useGroupAccountAssets();

  const currentPreferAccountType = preferAccountType[currentAccount.id];

  const updateCurrentPreferAccountType = async (preferAccountType: ChainToAccountTypeMap) => {
    await updatePreferAccountType(currentAccount.id, preferAccountType);

    await refetchAccountAssets();
    await refetchAccountAllAssets();
    await refetchGroupAssets();
  };

  return { currentPreferAccountType, updateCurrentPreferAccountType };
}
