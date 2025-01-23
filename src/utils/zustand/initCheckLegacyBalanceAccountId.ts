import { produce } from 'immer';

import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

export const removeInitCheckLegacyBalanceAccountId = async (accountId: string) => {
  const storedInitAccountIds = await getExtensionLocalStorage('initCheckLegacyBalanceAccountIds');

  const updatedInitAccountIds = storedInitAccountIds.filter((id) => id !== accountId);

  await setExtensionLocalStorage('initCheckLegacyBalanceAccountIds', updatedInitAccountIds);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.initCheckLegacyBalanceAccountIds = updatedInitAccountIds;
    }),
  );
};

export const removeInitCheckLegacyBalanceAccountIds = async (accountIds: string[]) => {
  const storedInitAccountIds = await getExtensionLocalStorage('initCheckLegacyBalanceAccountIds');

  const updatedInitAccountIds = storedInitAccountIds.filter((id) => !accountIds.includes(id));

  await setExtensionLocalStorage('initCheckLegacyBalanceAccountIds', updatedInitAccountIds);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.initCheckLegacyBalanceAccountIds = updatedInitAccountIds;
    }),
  );
};
