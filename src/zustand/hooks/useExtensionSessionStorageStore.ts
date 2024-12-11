import { produce } from 'immer';
import { create } from 'zustand';

import type { ExtensionSessionStorage } from '@/types/extension';
import type { ExtensionSessionStorageState, ExtensionSessionStorageStore } from '@/types/store/extensionSessionStorage';
import { getAllExtensionSessionStorage, setExtensionSessionStorage } from '@/utils/storage';

const initialState: ExtensionSessionStorageState = {
  password: null,
};

// TODO hydate될 떄 까지 보여줄 스플래시 스크린 필요.
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
  };
});

export const loadExtensionSessionStorageStoreFromStorage = async () => {
  const allStorage = await getAllExtensionSessionStorage();

  useExtensionSessionStorageStore.setState({
    ...allStorage,
  });
};
