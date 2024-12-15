import { produce } from 'immer';

import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

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

export const updateAccountName = async (accountId: string, accountName: string) => {
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

export const removeAccountName = async (accountId: string) => {
  const storedAccountNames = await getExtensionLocalStorage('accountNamesById');

  const updatedAccountNames = produce(storedAccountNames, (draft) => {
    delete draft[accountId];
  });

  await setExtensionLocalStorage('accountNamesById', updatedAccountNames);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.accountNamesById = updatedAccountNames;
    }),
  );
};

export const removeAccountNames = async (accountIds: string[]) => {
  const storedAccountNames = await getExtensionLocalStorage('accountNamesById');

  const updatedAccountNames = produce(storedAccountNames, (draft) => {
    accountIds.forEach((id) => {
      delete draft[id];
    });
  });

  await setExtensionLocalStorage('accountNamesById', updatedAccountNames);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.accountNamesById = updatedAccountNames;
    }),
  );
};
