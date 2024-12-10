import { produce } from 'immer';
import { create } from 'zustand';

import { DefaultSortKey } from '@/constants/initialStorage';
import type { ExtensionStorage } from '@/types/extension';
import type { ExtensionStorageState, ExtensionStorageStore } from '@/types/store/extensionStorage';
import { getAllExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';

const initialState: ExtensionStorageState = {
  accounts: [],
  paramsV11: {},
  assetsV11: [],
  erc20Assets: [],
  cw20Assets: [],
  initAccountIds: [],
  dashboardCoinSortKey: DefaultSortKey.dashboardCoinSortKey,
  dappListSortKey: DefaultSortKey.dappListSortKey,
  language: 'en',
  comparisonPasswordHash: '',
  accountNamesById: {},
  mnemonicNamesByHashedMnemonic: {},
  selectedAccountId: '',
};

export const useExtensionStorageStore = create<ExtensionStorageStore>()((set) => {
  return {
    ...initialState,
    updateExtensionStorageStore: async (key, value) => {
      await setExtensionLocalStorage(key, value);

      set((state) =>
        produce(state, (draft: ExtensionStorage) => {
          draft[key] = value;
        }),
      );
    },
  };
});

export const loadExtensionStorageStoreFromStorage = async () => {
  const allStorage = await getAllExtensionLocalStorage();

  useExtensionStorageStore.setState({
    ...allStorage,
  });
};
