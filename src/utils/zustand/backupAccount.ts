import { produce } from 'immer';

import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

export const addAccountToNotBackedupList = async (accountId: string) => {
  const notBackedUpAccountIds = await getExtensionLocalStorage('notBackedUpAccountIds');

  const updatedNotBackedUpAccountIds = [...notBackedUpAccountIds.filter((id) => id !== accountId), accountId];

  await setExtensionLocalStorage('notBackedUpAccountIds', updatedNotBackedUpAccountIds);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.notBackedUpAccountIds = updatedNotBackedUpAccountIds;
    }),
  );
};

export const removeAccountFromNotBackedupList = async (accountId: string) => {
  const notBackedUpAccountIds = await getExtensionLocalStorage('notBackedUpAccountIds');

  const updatedNotBackedUpAccountIds = notBackedUpAccountIds.filter((id) => id !== accountId);

  await setExtensionLocalStorage('notBackedUpAccountIds', updatedNotBackedUpAccountIds);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.notBackedUpAccountIds = updatedNotBackedUpAccountIds;
    }),
  );
};
export const removeAccountFromNotBackedupLists = async (accountIds: string[]) => {
  const notBackedUpAccountIds = await getExtensionLocalStorage('notBackedUpAccountIds');

  const updatedNotBackedUpAccountIds = notBackedUpAccountIds.filter((id) => !accountIds.includes(id));

  await setExtensionLocalStorage('notBackedUpAccountIds', updatedNotBackedUpAccountIds);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.notBackedUpAccountIds = updatedNotBackedUpAccountIds;
    }),
  );
};
