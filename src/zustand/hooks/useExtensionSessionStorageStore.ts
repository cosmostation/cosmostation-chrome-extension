import { produce } from 'immer';
import { create } from 'zustand';

import type { ExtensionSessionStorage } from '@/types/extension';
import type { ExtensionSessionStorageState, ExtensionSessionStorageStore } from '@/types/store/extensionSessionStorage';
import { getAllExtensionSessionStorage, setExtensionSessionStorage } from '@/utils/storage';

const initialState: ExtensionSessionStorageState = {
  password: null,
};

export const useExtensionSessionStorageStore = create<ExtensionSessionStorageStore>()((set) => {
  return {
    ...initialState,
    updateExtensionSessionStorageStore: async (key, value) => {
      await setExtensionSessionStorage(key, value);

      set((state) =>
        produce(state, (draft: ExtensionSessionStorage) => {
          draft[key] = value;
        }),
      );
    },
    resetExtensionSessionStorageStore: async () => {
      await setExtensionSessionStorage('password', null);

      set(initialState);
    },
  };
});

export const loadExtensionSessionStorageStoreFromStorage = async () => {
  const allStorage = await getAllExtensionSessionStorage();

  const initState = useExtensionSessionStorageStore.getInitialState();

  useExtensionSessionStorageStore.setState({
    ...initState,
    ...allStorage,
  });
};
