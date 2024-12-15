import { produce } from 'immer';

import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

export const removeInitAccountId = async (accountId: string) => {
  const storedInitAccountIds = await getExtensionLocalStorage('initAccountIds');

  const updatedInitAccountIds = storedInitAccountIds.filter((id) => id !== accountId);

  await setExtensionLocalStorage('initAccountIds', updatedInitAccountIds);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.initAccountIds = updatedInitAccountIds;
    }),
  );
};

export const removeInitAccountIds = async (accountIds: string[]) => {
  const storedInitAccountIds = await getExtensionLocalStorage('initAccountIds');

  const updatedInitAccountIds = storedInitAccountIds.filter((id) => !accountIds.includes(id));

  await setExtensionLocalStorage('initAccountIds', updatedInitAccountIds);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.initAccountIds = updatedInitAccountIds;
    }),
  );
};
