import { produce } from 'immer';

import { getDefaultAccountTypes } from '@/libs/accountType';
import type { ChainToAccountTypeMap } from '@/types/account';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

export const addPreferAccountType = async (accountId: string, preferAccountType?: ChainToAccountTypeMap) => {
  const storedPreferAccountType = await getExtensionLocalStorage('preferAccountType');
  const defaultPreferAccountTypes = await getDefaultAccountTypes();

  const selectedPreferAccountType = preferAccountType || defaultPreferAccountTypes;

  const updatedPreferAccountType = produce(storedPreferAccountType, (draft) => {
    draft[accountId] = selectedPreferAccountType;
  });

  await setExtensionLocalStorage('preferAccountType', updatedPreferAccountType);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.preferAccountType = updatedPreferAccountType;
    }),
  );
};

export const removePreferAccountType = async (accountId: string) => {
  const storedPreferAccountType = await getExtensionLocalStorage('preferAccountType');

  const updatedPreferAccountType = produce(storedPreferAccountType, (draft) => {
    delete draft[accountId];
  });

  await setExtensionLocalStorage('preferAccountType', updatedPreferAccountType);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.preferAccountType = updatedPreferAccountType;
    }),
  );
};
export const removePreferAccountTypes = async (accountIds: string[]) => {
  const storedPreferAccountType = await getExtensionLocalStorage('preferAccountType');

  const updatedPreferAccountType = produce(storedPreferAccountType, (draft) => {
    accountIds.forEach((id) => {
      delete draft[id];
    });
  });

  await setExtensionLocalStorage('preferAccountType', updatedPreferAccountType);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.preferAccountType = updatedPreferAccountType;
    }),
  );
};

export const updatePreferAccountType = async (accountId: string, preferAccountType: ChainToAccountTypeMap) => {
  const storedPreferAccountType = await getExtensionLocalStorage('preferAccountType');

  const updatedPreferAccountType = produce(storedPreferAccountType, (draft) => {
    draft[accountId] = preferAccountType;
  });

  await setExtensionLocalStorage('preferAccountType', updatedPreferAccountType);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.preferAccountType = updatedPreferAccountType;
    }),
  );
};
