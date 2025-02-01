import { produce } from 'immer';
import { create } from 'zustand';

import { AD_POPOVER_IDS } from '@/constants/adPopover';
import { CURRENCY_TYPE } from '@/constants/currency';
import { DefaultSortKey } from '@/constants/initialStorage';
import type { CurrencyType } from '@/types/currency';
import type { AdPopoverStateMap, ExtensionStorage } from '@/types/extension';
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
      // FIXME 자동으로 키 가져와서 삭제하도록 변경 필요.
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
      await setExtensionLocalStorage('addressBookList', []);
      await setExtensionLocalStorage('customCw20Assets', []);
      await setExtensionLocalStorage('customErc20Assets', []);
      await setExtensionLocalStorage('customAssets', []);
      await setExtensionLocalStorage('customHiddenAssetIds', []);
      await setExtensionLocalStorage('initCheckLegacyBalanceAccountIds', []);
      await setExtensionLocalStorage('approvedOrigins', []);
      await setExtensionLocalStorage('adPopoverState', initialState.adPopoverState);
      await setExtensionLocalStorage('isBalanceVisible', true);
      await setExtensionLocalStorage('approvedSuiPermissions', []);
      await setExtensionLocalStorage('requestQueue', []);

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
