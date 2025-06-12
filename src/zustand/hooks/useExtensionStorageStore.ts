import { produce } from 'immer';
import { create } from 'zustand';

import { AD_POPOVER_IDS } from '@/constants/adPopover';
import { CURRENCY_TYPE } from '@/constants/currency';
import { DefaultSortKey } from '@/constants/initialStorage';
import { PRICE_TREND_TYPE } from '@/constants/price';
import type { CurrencyType } from '@/types/currency';
import type { AdPopoverStateMap, ExtensionStorage, ExtensionStorageKeys } from '@/types/extension';
import type { ExtensionStorageState, ExtensionStorageStore } from '@/types/store/extensionStorage';
import { deleteKeysContainingString, getAllExtensionLocalStorage, getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';

export const initialState: ExtensionStorageState = {
  userAccounts: [],
  paramsV11: {},
  assetsV11: [],
  erc20Assets: [],
  customErc20Assets: [],
  cw20Assets: [],
  customCw20Assets: [],
  initAccountIds: [],
  initCheckLegacyBalanceAccountIds: [],
  dashboardCoinSortKey: DefaultSortKey.dashboardCoinSortKey,
  dappListSortKey: DefaultSortKey.dappListSortKey,
  chainListSortKey: DefaultSortKey.chainListSortKey,
  userLanguagePreference: 'en',
  comparisonPasswordHash: '',
  accountNamesById: {},
  mnemonicNamesByHashedMnemonic: {},
  currentAccountId: '',
  notBackedUpAccountIds: [],
  userCurrencyPreference: CURRENCY_TYPE.USD as CurrencyType,
  preferAccountType: {},
  addressBookList: [],
  addedCustomChainList: [],
  customAssets: [],
  customHiddenAssetIds: [],
  requestQueue: [],
  approvedOrigins: [],
  adPopoverState: AD_POPOVER_IDS.reduce((acc: AdPopoverStateMap, cur) => {
    acc[cur] = {
      isVisiable: false,
    };
    return acc;
  }, {}),
  isBalanceVisible: true,
  isHideSmalValue: false,
  approvedSuiPermissions: [],
  approvedIotaPermissions: [],
  chosenEthereumNetworkId: '',
  chosenSuiNetworkId: '',
  chosenAptosNetworkId: '',
  chosenBitcoinNetworkId: '',
  chosenIotaNetworkId: '',
  currentWindowId: null,
  prioritizedProvider: {
    keplr: false,
    metamask: false,
    aptos: false,
  },
  pinnedDappIds: [],
  autoLockTimeInMinutes: '30',
  autoLockTimeStampAt: null,
  migrationStatus: null,
  userPriceTrendPreference: PRICE_TREND_TYPE.GREEN_UP,
  selectedChainFilterId: null,
};

export const notDeleteKeys = ['paramsV11', 'assetsV11', 'erc20Assets', 'cw20Assets', 'migrationStatus'];

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
      const accounts = await getExtensionLocalStorage('userAccounts');
      const extensionStorageKeys = Object.keys(initialState);
      const shouldDeleteKeys = extensionStorageKeys.filter((key) => !notDeleteKeys.includes(key));

      const resetPromises = shouldDeleteKeys.map((key) => setExtensionLocalStorage(key as ExtensionStorageKeys, initialState[key as ExtensionStorageKeys]));
      await Promise.all(resetPromises);

      const removePromises = accounts.map(({ id }) => deleteKeysContainingString(id));
      await Promise.all(removePromises);

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
