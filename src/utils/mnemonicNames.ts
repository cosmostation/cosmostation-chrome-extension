import { produce } from 'immer';

import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { getExtensionLocalStorage, setExtensionLocalStorage } from './storage';

export const addMnemonicName = async (mnemonicId: string, mnemonicName: string) => {
  const storedMnemonicNames = await getExtensionLocalStorage('mnemonicNamesByHashedMnemonic');

  const updatedMnemonicNames = produce(storedMnemonicNames, (draft) => {
    draft[mnemonicId] = mnemonicName;
  });

  await setExtensionLocalStorage('mnemonicNamesByHashedMnemonic', updatedMnemonicNames);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.mnemonicNamesByHashedMnemonic = updatedMnemonicNames;
    }),
  );
};

export const updateMnemonicName = async (mnemonicId: string, mnemonicName: string) => {
  const storedMnemonicNames = await getExtensionLocalStorage('mnemonicNamesByHashedMnemonic');

  const updatedMnemonicNames = produce(storedMnemonicNames, (draft) => {
    draft[mnemonicId] = mnemonicName;
  });

  await setExtensionLocalStorage('mnemonicNamesByHashedMnemonic', updatedMnemonicNames);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.mnemonicNamesByHashedMnemonic = updatedMnemonicNames;
    }),
  );
};

export const removeMnemonicName = async (mnemonicId: string) => {
  const storedMnemonicNames = await getExtensionLocalStorage('mnemonicNamesByHashedMnemonic');

  const updatedMnemonicNames = produce(storedMnemonicNames, (draft) => {
    delete draft[mnemonicId];
  });

  await setExtensionLocalStorage('mnemonicNamesByHashedMnemonic', updatedMnemonicNames);

  useExtensionStorageStore.setState((currentState) =>
    produce(currentState, (draft) => {
      draft.mnemonicNamesByHashedMnemonic = updatedMnemonicNames;
    }),
  );
};
