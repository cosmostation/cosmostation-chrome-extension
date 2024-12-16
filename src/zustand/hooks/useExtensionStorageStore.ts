import { produce } from 'immer';
import { create } from 'zustand';

import { CURRENCY_TYPE } from '@/constants/currency';
import { DefaultSortKey } from '@/constants/initialStorage';
import type { CurrencyType } from '@/types/currency';
import type { ExtensionStorage } from '@/types/extension';
import type { ExtensionStorageState, ExtensionStorageStore } from '@/types/store/extensionStorage';
import { getAllExtensionLocalStorage, getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';

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
  notBackedUpAccountIds: [],
  // TODO language에 따라 초기화
  currency: CURRENCY_TYPE.USD as CurrencyType,
  preferAccountType: {},
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
    resetExtensionStorageStore: async () => {
      const accounts = await getExtensionLocalStorage('accounts');
      await setExtensionLocalStorage('accounts', []);
      await setExtensionLocalStorage('initAccountIds', []);
      await setExtensionLocalStorage('dashboardCoinSortKey', DefaultSortKey.dashboardCoinSortKey);
      await setExtensionLocalStorage('dappListSortKey', DefaultSortKey.dappListSortKey);
      await setExtensionLocalStorage('language', 'en');
      await setExtensionLocalStorage('comparisonPasswordHash', '');
      await setExtensionLocalStorage('accountNamesById', {});
      await setExtensionLocalStorage('mnemonicNamesByHashedMnemonic', {});
      await setExtensionLocalStorage('selectedAccountId', '');
      await setExtensionLocalStorage('notBackedUpAccountIds', []);
      await setExtensionLocalStorage('currency', CURRENCY_TYPE.USD as CurrencyType);
      await setExtensionLocalStorage('preferAccountType', {});

      const accountIds = accounts.map((account) => account.id);

      accountIds.forEach(async (accountId) => {
        await chrome.storage.local.remove([
          `${accountId}-address`,
          `${accountId}-balance-aptos`,
          `${accountId}-balance-cosmos`,
          `${accountId}-balance-cw20`,
          `${accountId}-balance-erc20`,
          `${accountId}-balance-evm`,
          `${accountId}-balance-sui`,
          `${accountId}-hidden-assetIds`,
        ]);
      });

      set(initialState);
    },
  };
});

export const loadExtensionStorageStoreFromStorage = async () => {
  const allStorage = await getAllExtensionLocalStorage();

  useExtensionStorageStore.setState({
    ...allStorage,
  });
};
