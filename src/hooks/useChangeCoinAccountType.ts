import { produce } from 'immer';

import type { ChainAccountType } from '@/types/chain';
import { devLogger } from '@/utils/devLogger';
import { parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { useCurrentAccount } from './useCurrentAccount';
import { useCurrentPreferAccountTypes } from './useCurrentPreferAccountTypes';
import { useSyncChainFilterIdWithAccountType } from './useSyncChainFilterIdWithAccountType';

export function useChangeCoinAccountType() {
  const selectedChainFilterId = useExtensionStorageStore((state) => state.selectedChainFilterId);
  const { currentAccount } = useCurrentAccount();

  const { syncChainFilterIdWithAccountType } = useSyncChainFilterIdWithAccountType();
  const { updateCurrentPreferAccountType } = useCurrentPreferAccountTypes();

  const changeCoinType = async (id: string, accountType: ChainAccountType) => {
    try {
      const updateSelectedChainFilterId = async () => {
        const currentParsedChainFilterId = selectedChainFilterId && parseUniqueChainId(selectedChainFilterId);
        const isChangeSameChain = id === currentParsedChainFilterId?.id;

        if (isChangeSameChain) {
          await syncChainFilterIdWithAccountType(accountType);
        }
      };

      const updatedPreferAccountTypeFunc = async () => {
        const storedPreferAccountType = (await getExtensionLocalStorage('preferAccountType')) ?? {};

        const preferredAccountType = storedPreferAccountType[currentAccount.id];

        const updatedPreferAccountType = preferredAccountType
          ? produce(preferredAccountType, (draft) => {
              draft[id] = accountType;
            })
          : preferredAccountType;

        if (!updatedPreferAccountType) {
          return;
        }
        await updateCurrentPreferAccountType(updatedPreferAccountType);
      };

      await updatedPreferAccountTypeFunc();
      await updateSelectedChainFilterId();
    } catch (error) {
      devLogger.error(`[ChangeAccountType in ChainlistBottomSheet] Error`, error);
    }
  };

  return { changeCoinType };
}
