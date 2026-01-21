import { produce } from 'immer';
import { create } from 'zustand';

import { CURRENCY_TYPE } from '@/constants/currency';
import { DefaultSortKey } from '@/constants/initialStorage';
import { PRICE_TREND_TYPE } from '@/constants/price';
import type { CurrencyType } from '@/types/currency';
import type { ExtensionStorage, StoreSyncedStorage, StoreSyncedStorageKeys } from '@/types/extension';
import type { ExtensionStorageStore } from '@/types/store/extensionStorage';
import { deleteKeysContainingString, getExtensionLocalStorage, getMultipleFromExtensionStorage, setExtensionLocalStorage } from '@/utils/storage';

export const initialState: StoreSyncedStorage = {
  userCurrencyPreference: CURRENCY_TYPE.USD as CurrencyType,
  userPriceTrendPreference: PRICE_TREND_TYPE.GREEN_UP,
  userLanguagePreference: 'en',
  dappListSortKey: DefaultSortKey.dappListSortKey,
  dashboardCoinSortKey: DefaultSortKey.dashboardCoinSortKey,
  chainListSortKey: DefaultSortKey.chainListSortKey,
  isBalanceVisible: true,
  isHideSmalValue: false,
  autoLockTimeInMinutes: '30',

  userAccounts: [],
  accountNamesById: {},
  mnemonicNamesByHashedMnemonic: {},
  notBackedUpAccountIds: [],
  preferAccountType: {},

  chosenEthereumNetworkId: '',
  chosenAptosNetworkId: '',
  chosenSuiNetworkId: '',
  chosenBitcoinNetworkId: '',
  chosenIotaNetworkId: '',
  chosenSolanaNetworkId: '',
  chosenGnoNetworkId: '',
  selectedChainFilterId: null,
  addedCustomChainList: [],

  customErc20Assets: [],
  customCw20Assets: [],
  customAssets: [],
  customHiddenAssetIds: [],

  approvedOrigins: [],
  approvedSuiPermissions: [],
  approvedIotaPermissions: [],
  pinnedDappIds: [],
  prioritizedProvider: { keplr: false, metamask: false, aptos: false },

  addressBookList: [],

  comparisonPasswordHash: '',

  currentAccountId: '',
  initAccountIds: [],
  initCheckLegacyBalanceAccountIds: [],
  requestQueue: [],
  adPopoverState: {},
  currentWindowId: null,
  autoLockTimeStampAt: null,
  migrationStatus: null,
  lastRequestTimestamps: null,
};

export const notDeleteKeys = ['paramsV11', 'assetsV11', 'erc20Assets', 'cw20Assets', 'grc20Assets', 'migrationStatus', 'spltokenAssets'];

export const useExtensionStorageStore = create<ExtensionStorageStore>()((set) => {
  return {
    ...initialState,
    updateExtensionStorageStore: async (key, value) => {
      await setExtensionLocalStorage(key, value as ExtensionStorage[typeof key]);

      set((state) =>
        produce(state, (draft: StoreSyncedStorage) => {
          draft[key] = value;
        }),
      );
    },
    resetExtensionStorageStore: async () => {
      const accounts = await getExtensionLocalStorage('userAccounts');
      const extensionStorageKeys = Object.keys(initialState);
      const shouldDeleteKeys = extensionStorageKeys.filter((key) => !notDeleteKeys.includes(key));

      const resetPromises = shouldDeleteKeys.map((key) => setExtensionLocalStorage(key as StoreSyncedStorageKeys, initialState[key as StoreSyncedStorageKeys]));
      await Promise.all(resetPromises);

      const removePromises = accounts.map(({ id }) => deleteKeysContainingString(id));
      await Promise.all(removePromises);

      set(initialState);
    },
  };
});

export const loadExtensionStorageStoreFromStorage = async () => {
  const allKeys = Object.keys(initialState) as StoreSyncedStorageKeys[];
  const storage = await getMultipleFromExtensionStorage(allKeys);

  useExtensionStorageStore.setState({ ...initialState, ...storage });
};

export const loadExtensionStorageStoreFromStorageByKey = async <K extends StoreSyncedStorageKeys>(key: K) => {
  const value = (await getExtensionLocalStorage(key)) as StoreSyncedStorage[K];

  useExtensionStorageStore.setState({ [key]: value } as Pick<ExtensionStorageStore, K>);
};
