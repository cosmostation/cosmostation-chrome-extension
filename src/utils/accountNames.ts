import { produce } from 'immer';

import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { getExtensionLocalStorage, setExtensionLocalStorage } from './storage';

export const addAccountName = async (accountId: string, accountName: string) => {
  const storedAccountNames = await getExtensionLocalStorage('accountNamesById');

  const updatedAccountNames = produce(storedAccountNames, (draft) => {
    draft[accountId] = accountName;
  });

  await setExtensionLocalStorage('accountNamesById', updatedAccountNames);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.accountNamesById = updatedAccountNames;
    }),
  );
};
