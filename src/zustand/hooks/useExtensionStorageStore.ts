import { produce } from 'immer';
import { create } from 'zustand';

import { AD_POPOVER_IDS } from '@/constants/adPopover';
import { CURRENCY_TYPE } from '@/constants/currency';
import { DefaultSortKey } from '@/constants/initialStorage';
import type { CurrencyType } from '@/types/currency';
import type { AdPopoverStateMap, ExtensionStorage, ExtensionStorageKeys } from '@/types/extension';
import type { ExtensionStorageState, ExtensionStorageStore } from '@/types/store/extensionStorage';
import { deleteKeysContainingString, getAllExtensionLocalStorage, getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';

export const initialState: ExtensionStorageState = {
  accounts: [],
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
  language: 'en',
  comparisonPasswordHash: '',
  accountNamesById: {},
  mnemonicNamesByHashedMnemonic: {},
  selectedAccountId: '',
  notBackedUpAccountIds: [],
  // TODO language에 따라 초기화
  currency: CURRENCY_TYPE.USD as CurrencyType,
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
  approvedSuiPermissions: [],
  chosenEthereumNetworkId: '',
  chosenSuiNetworkId: '',
  chosenAptosNetworkId: '',
  chosenBitcoinNetworkId: '',
  currentWindowId: null,
  prioritizedProvider: {
    keplr: false,
    metamask: false,
    aptos: false,
  },
  pinnedDappIds: [],
};

const notDeleteKeys = ['paramsV11', 'assetsV11', 'erc20Assets', 'cw20Assets'];

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
      // FIXME 자동으로 키 가져와서 삭제하도록 변경 필요.
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
