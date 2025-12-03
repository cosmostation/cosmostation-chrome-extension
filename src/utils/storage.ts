import { produce } from 'immer';
import { browser } from 'wxt/browser';

import { CURRENCY_TYPE } from '@/constants/currency';
import { DefaultSortKey } from '@/constants/initialStorage';
import { PRICE_TREND_TYPE } from '@/constants/price';
import { getChains } from '@/libs/chain';
import { v11 } from '@/script/service-worker/update/v11';
import type { AccountNamesById, ChainToAccountTypeMap, PreferAccountType } from '@/types/account';
import type {
  DefaultExtensionStorage,
  ExtensionSessionStorage,
  ExtensionSessionStorageKeys,
  ExtensionStorage,
  ExtensionStorageKeys,
  PrioritizedProvider,
} from '@/types/extension';

import { extension } from './browser';
import { aesDecrypt } from './crypto';
import { getUniqueChainId } from './queryParamGenerator';

export async function initExtensionLocalStorage() {
  await initializeStorageDefaults();

  await initializeCurrentAccountId();
  await initializeChosenNetworks();

  await setMissingAccountNames();

  await setMissingMnemonicNames();

  await setMissingPreferAccountType();

  await initializePreferAccountType();

  await patchDukongPreferAccountTypeMismatching();
}

export async function setExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T, value: ExtensionStorage[T]) {
  await extension.storage.local.set({ [key]: value as ExtensionStorage[T] });
}

export async function getExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T) {
  const localStorage = await extension.storage.local.get(key);

  return localStorage[key] as ExtensionStorage[T];
}

export const deleteKeysContainingString = async (searchString: string): Promise<void> => {
  browser.storage.local.get(null, (items) => {
    if (browser.runtime.lastError) {
      console.error(browser.runtime.lastError);
      return;
    }

    const keysToDelete = Object.keys(items).filter((key) => key.includes(searchString));

    if (keysToDelete.length > 0) {
      browser.storage.local.remove(keysToDelete, () => {
        if (browser.runtime.lastError) {
          console.error(browser.runtime.lastError);
        }
      });
    } else {
      console.log(`No keys found containing the string: "${searchString}"`);
    }
  });
};

export async function getAllExtensionLocalStorage(): Promise<ExtensionStorage> {
  const localStorage = await extension.storage.local.get();

  return localStorage as ExtensionStorage;
}

export async function setExtensionSessionStorage<T extends ExtensionSessionStorageKeys>(key: T, value: ExtensionSessionStorage[T]) {
  await extension.storage.session.set({ [key]: value as ExtensionSessionStorage[T] });
}

export async function getExtensionSessionStorage<T extends ExtensionSessionStorageKeys>(key: T) {
  const sessionStorage = await extension.storage.session.get(key);

  return sessionStorage[key] as ExtensionSessionStorage[T];
}

export async function getAllExtensionSessionStorage(): Promise<ExtensionSessionStorage> {
  const sessionStorage = await extension.storage.session.get();

  return sessionStorage as ExtensionSessionStorage;
}

type DefaultStorageKeysMap = {
  [K in keyof DefaultExtensionStorage]: K;
};

const DEFAULT_STORAGE_KEYS: DefaultStorageKeysMap = {
  paramsV11: 'paramsV11',
  assetsV11: 'assetsV11',
  userCurrencyPreference: 'userCurrencyPreference',
  userPriceTrendPreference: 'userPriceTrendPreference',
  dappListSortKey: 'dappListSortKey',
  dashboardCoinSortKey: 'dashboardCoinSortKey',
  chainListSortKey: 'chainListSortKey',
  userAccounts: 'userAccounts',
  accountNamesById: 'accountNamesById',
  mnemonicNamesByHashedMnemonic: 'mnemonicNamesByHashedMnemonic',
  notBackedUpAccountIds: 'notBackedUpAccountIds',
  preferAccountType: 'preferAccountType',
  customErc20Assets: 'customErc20Assets',
  customCw20Assets: 'customCw20Assets',
  addressBookList: 'addressBookList',
  addedCustomChainList: 'addedCustomChainList',
  customAssets: 'customAssets',
  customHiddenAssetIds: 'customHiddenAssetIds',
  approvedOrigins: 'approvedOrigins',
  requestQueue: 'requestQueue',
  approvedSuiPermissions: 'approvedSuiPermissions',
  approvedIotaPermissions: 'approvedIotaPermissions',
  initCheckLegacyBalanceAccountIds: 'initCheckLegacyBalanceAccountIds',
  isBalanceVisible: 'isBalanceVisible',
  isHideSmalValue: 'isHideSmalValue',
  adPopoverState: 'adPopoverState',
  currentWindowId: 'currentWindowId',
  prioritizedProvider: 'prioritizedProvider',
  pinnedDappIds: 'pinnedDappIds',
  autoLockTimeInMinutes: 'autoLockTimeInMinutes',
};

export async function extensionSessionStorage() {
  const storage = await getAllExtensionSessionStorage();

  const currentPassword = storage.sessionPassword
    ? aesDecrypt(storage.sessionPassword.encryptedPassword, `${storage.sessionPassword.key}${storage.sessionPassword.timestamp}`)
    : null;

  return {
    ...storage,
    currentPassword,
  };
}

async function initializeStorageDefaults() {
  const keysToFetch = Object.keys(DEFAULT_STORAGE_KEYS) as (keyof DefaultExtensionStorage)[];

  const originStorage = await browser.storage.local.get<DefaultExtensionStorage>(keysToFetch);

  if (!originStorage.paramsV11 || !originStorage.assetsV11) {
    await v11();
  }

  if (!originStorage.userCurrencyPreference) {
    const newCurrency = CURRENCY_TYPE.USD;

    await setExtensionLocalStorage('userCurrencyPreference', newCurrency);
  }
  if (!originStorage.userPriceTrendPreference) {
    await setExtensionLocalStorage('userPriceTrendPreference', PRICE_TREND_TYPE.GREEN_UP);
  }

  if (!originStorage.dappListSortKey) {
    await setExtensionLocalStorage('dappListSortKey', DefaultSortKey.dappListSortKey);
  }

  if (!originStorage.dashboardCoinSortKey) {
    await setExtensionLocalStorage('dashboardCoinSortKey', DefaultSortKey.dashboardCoinSortKey);
  }

  if (!originStorage.chainListSortKey) {
    await setExtensionLocalStorage('chainListSortKey', DefaultSortKey.chainListSortKey);
  }

  if (!originStorage.userAccounts) {
    await setExtensionLocalStorage('userAccounts', []);
  }

  if (!originStorage.accountNamesById) {
    await setExtensionLocalStorage('accountNamesById', {});
  }

  if (!originStorage.mnemonicNamesByHashedMnemonic) {
    await setExtensionLocalStorage('mnemonicNamesByHashedMnemonic', {});
  }

  if (!originStorage.notBackedUpAccountIds) {
    await setExtensionLocalStorage('notBackedUpAccountIds', []);
  }

  if (!originStorage.preferAccountType) {
    await setExtensionLocalStorage('preferAccountType', {});
  }

  if (!originStorage.customErc20Assets) {
    await setExtensionLocalStorage('customErc20Assets', []);
  }

  if (!originStorage.customCw20Assets) {
    await setExtensionLocalStorage('customCw20Assets', []);
  }

  if (!originStorage.addressBookList) {
    await setExtensionLocalStorage('addressBookList', []);
  }

  if (!originStorage.addedCustomChainList) {
    await setExtensionLocalStorage('addedCustomChainList', []);
  }

  if (!originStorage.customAssets) {
    await setExtensionLocalStorage('customAssets', []);
  }

  if (!originStorage.customHiddenAssetIds) {
    await setExtensionLocalStorage('customHiddenAssetIds', []);
  }

  if (!originStorage.approvedOrigins) {
    await setExtensionLocalStorage('approvedOrigins', []);
  }

  if (!originStorage.requestQueue) {
    await setExtensionLocalStorage('requestQueue', []);
  }

  if (!originStorage.approvedSuiPermissions) {
    await setExtensionLocalStorage('approvedSuiPermissions', []);
  }

  if (!originStorage.approvedIotaPermissions) {
    await setExtensionLocalStorage('approvedIotaPermissions', []);
  }

  if (!originStorage.initCheckLegacyBalanceAccountIds) {
    await setExtensionLocalStorage('initCheckLegacyBalanceAccountIds', []);
  }

  if (originStorage.isBalanceVisible === undefined || originStorage.isBalanceVisible === null) {
    await setExtensionLocalStorage('isBalanceVisible', true);
  }

  if (originStorage.isHideSmalValue === undefined || originStorage.isHideSmalValue === null) {
    await setExtensionLocalStorage('isHideSmalValue', false);
  }

  if (!originStorage.currentWindowId) {
    await setExtensionLocalStorage('currentWindowId', null);
  }

  if (
    originStorage.prioritizedProvider?.aptos === undefined ||
    originStorage.prioritizedProvider?.metamask === undefined ||
    originStorage.prioritizedProvider?.keplr === undefined
  ) {
    const newProviders: PrioritizedProvider = {
      aptos: originStorage.prioritizedProvider?.aptos === undefined ? false : originStorage.prioritizedProvider?.aptos,
      keplr: originStorage.prioritizedProvider?.keplr === undefined ? false : originStorage.prioritizedProvider?.keplr,
      metamask: originStorage.prioritizedProvider?.metamask === undefined ? false : originStorage.prioritizedProvider?.metamask,
    };

    await setExtensionLocalStorage('prioritizedProvider', newProviders);
  }

  if (!originStorage.pinnedDappIds) {
    await setExtensionLocalStorage('pinnedDappIds', []);
  }

  if (!originStorage.autoLockTimeInMinutes) {
    await setExtensionLocalStorage('autoLockTimeInMinutes', '30');
  }
}

async function initializeChosenNetworks() {
  const storedChosenEthereumNetworkId = await getExtensionLocalStorage('chosenEthereumNetworkId');
  const storedChosenAptosNetworkId = await getExtensionLocalStorage('chosenAptosNetworkId');
  const storedChosenSuiNetworkId = await getExtensionLocalStorage('chosenSuiNetworkId');
  const storedChosenBitcoinNetworkId = await getExtensionLocalStorage('chosenBitcoinNetworkId');
  const storedChosenIotaNetworkId = await getExtensionLocalStorage('chosenIotaNetworkId');
  const storedChosenSolanaNetworkId = await getExtensionLocalStorage('chosenSolanaNetworkId');
  const storedChosenGnoNetworkId = await getExtensionLocalStorage('chosenGnoNetworkId');

  const { evmChains, aptosChains, suiChains, bitcoinChains, iotaChains, solanaChains, gnoChains } = await getChains();

  if (!storedChosenEthereumNetworkId) {
    const defaultEVMNetwork = evmChains.find((item) => item.id === 'ethereum') || evmChains[0];

    const defaultEVMNetworkId = getUniqueChainId(defaultEVMNetwork);

    await setExtensionLocalStorage('chosenEthereumNetworkId', defaultEVMNetworkId);
  }

  if (!storedChosenAptosNetworkId) {
    const defaultAptosNetwork = aptosChains.find((item) => item.id === 'aptos') || aptosChains[0];

    const defaultAptosNetworkId = getUniqueChainId(defaultAptosNetwork);

    await setExtensionLocalStorage('chosenAptosNetworkId', defaultAptosNetworkId);
  }

  if (!storedChosenSuiNetworkId) {
    const defaultSuiNetwork = suiChains.find((item) => item.id === 'sui') || suiChains[0];

    const defaultSuiNetworkId = getUniqueChainId(defaultSuiNetwork);

    await setExtensionLocalStorage('chosenSuiNetworkId', defaultSuiNetworkId);
  }

  if (!storedChosenBitcoinNetworkId) {
    const defaultBitcoinNetwork = bitcoinChains.find((item) => item.id === 'bitcoin') || bitcoinChains[0];

    const defaultBitcoinNetworkId = getUniqueChainId(defaultBitcoinNetwork);

    await setExtensionLocalStorage('chosenBitcoinNetworkId', defaultBitcoinNetworkId);
  }

  if (!storedChosenIotaNetworkId && iotaChains.length > 0) {
    const defaultIotaNetwork = iotaChains.find((item) => item.id === 'iota') || iotaChains[0];

    const defaultIotaNetworkId = getUniqueChainId(defaultIotaNetwork);

    await setExtensionLocalStorage('chosenIotaNetworkId', defaultIotaNetworkId);
  }

  if (!storedChosenSolanaNetworkId && solanaChains.length > 0) {
    const defaultSolanaNetwork = solanaChains.find((item) => item.id === 'solana') || solanaChains[0];

    const defaultSolanaNetworkId = getUniqueChainId(defaultSolanaNetwork);

    await setExtensionLocalStorage('chosenSolanaNetworkId', defaultSolanaNetworkId);
  }
  if (!storedChosenGnoNetworkId) {
    const defaultGnoNetwork = gnoChains.find((item) => item.id === 'gno') || gnoChains[0];

    const defaultGnoNetworkId = getUniqueChainId(defaultGnoNetwork);

    await setExtensionLocalStorage('chosenGnoNetworkId', defaultGnoNetworkId);
  }
}

async function initializeCurrentAccountId() {
  const storedCurrentAccountId = await getExtensionLocalStorage('currentAccountId');
  const storedUserAccounts = await getExtensionLocalStorage('userAccounts');

  const defaultAccountId = storedCurrentAccountId || (storedUserAccounts && storedUserAccounts.length > 0 ? storedUserAccounts[0]?.id || '' : '');

  await setExtensionLocalStorage('currentAccountId', defaultAccountId);
}

async function setMissingMnemonicNames() {
  const mnemonicNamesStorage = await getExtensionLocalStorage('mnemonicNamesByHashedMnemonic');
  const userAccounts = await getExtensionLocalStorage('userAccounts');

  if (mnemonicNamesStorage && userAccounts && userAccounts.length > 0) {
    const mnemonicNameKeys = Object.keys(mnemonicNamesStorage);

    const mnemonicAccountsMissingMnemonicNames = userAccounts
      .filter((item) => item.type === 'MNEMONIC')
      .filter((item) => !mnemonicNameKeys.includes(item.encryptedRestoreString));

    if (mnemonicAccountsMissingMnemonicNames.length > 0) {
      const totalMnemonicNames = mnemonicNameKeys.length;

      const uniqueEncryptedRestoreStrings = [...new Set(mnemonicAccountsMissingMnemonicNames.map((item) => item.encryptedRestoreString))];

      const updatedMnemonicNamesByHashedMnemonic = uniqueEncryptedRestoreStrings.reduce((acc: AccountNamesById, cur, i) => {
        acc[cur] = `Mnemonic ${totalMnemonicNames + i + 1}`;
        return acc;
      }, {});

      const mergedMnemonicNamesByHashedMnemonic = { ...mnemonicNamesStorage, ...updatedMnemonicNamesByHashedMnemonic };

      await setExtensionLocalStorage('mnemonicNamesByHashedMnemonic', mergedMnemonicNamesByHashedMnemonic);
    }
  }
}

async function setMissingAccountNames() {
  const userAccounts = await getExtensionLocalStorage('userAccounts');
  const accountNameMap = await getExtensionLocalStorage('accountNamesById');

  const canCheckMissingAccountNames = accountNameMap && userAccounts && userAccounts.length > 0;

  if (canCheckMissingAccountNames) {
    const accountNameKeys = Object.keys(accountNameMap);

    const missingNameAccounts = userAccounts.filter((item) => !accountNameKeys.includes(item.id));

    if (missingNameAccounts.length > 0) {
      const totalAccountNames = accountNameKeys.length;

      const uniqueMissingNamesAccountIds = [...new Set(missingNameAccounts.map((item) => item.id))];

      const newAccountNameMapping = uniqueMissingNamesAccountIds.reduce((acc: AccountNamesById, cur, i) => {
        acc[cur] = `Account ${totalAccountNames + i + 1}`;
        return acc;
      }, {});

      const mergedAccountNamesById = { ...accountNameMap, ...newAccountNameMapping };

      await setExtensionLocalStorage('accountNamesById', mergedAccountNamesById);
    }
  }
}

async function setMissingPreferAccountType() {
  const storedPreferAccountType = await getExtensionLocalStorage('preferAccountType');
  const paramsV11 = await getExtensionLocalStorage('paramsV11');
  const userAccounts = await getExtensionLocalStorage('userAccounts');

  if (!storedPreferAccountType || (storedPreferAccountType && Object.keys(storedPreferAccountType).length < 1) || !paramsV11 || !userAccounts) {
    return;
  }

  const chainIds = Object.keys(paramsV11);
  const chainInfos = chainIds.map((chainId) => {
    const chainInfo = paramsV11[chainId];

    return {
      id: chainId,
      ...chainInfo,
    };
  });

  const filteredAccountTypes = chainInfos.filter((item) => item.params.chainlist_params?.account_type && item.params.chainlist_params.account_type.length > 1);

  const freshMultiAccountChainNames = filteredAccountTypes.map((item) => item.id);

  const notStoredNewMultiAccountChainName = freshMultiAccountChainNames
    .filter((item) => {
      const storedAccountTypeSample = Object.values(storedPreferAccountType)[0];

      const isNotStoredMultiAccountChainName = storedAccountTypeSample ? !Object.keys(storedAccountTypeSample).includes(item) : true;
      return isNotStoredMultiAccountChainName;
    })
    .filter((item) => !!item);

  if (notStoredNewMultiAccountChainName && notStoredNewMultiAccountChainName.length > 0) {
    const newPreferAccountType: ChainToAccountTypeMap = {};

    notStoredNewMultiAccountChainName.forEach((item) => {
      const newChainAccountType = filteredAccountTypes.find((ac) => ac.params.chainlist_params?.api_name === item)?.params.chainlist_params?.account_type;
      const defaultAccountType = newChainAccountType?.find((type) => type.is_default !== false);

      if (defaultAccountType) {
        const type = {
          hdPath: defaultAccountType.hd_path.replace('X', '${index}'),
          pubkeyStyle: defaultAccountType.pubkey_style,
          isDefault: defaultAccountType.is_default,
          pubkeyType: defaultAccountType.pubkey_type,
        };
        newPreferAccountType[item] = type;
      }
    });

    const updatedPreferAccountType = userAccounts.reduce((acc: PreferAccountType, cur) => {
      const oldPreferAccountType = storedPreferAccountType[cur.id];
      const mergedPreferAccountType = { ...oldPreferAccountType, ...newPreferAccountType };

      acc[cur.id] = mergedPreferAccountType;
      return acc;
    }, {});

    await setExtensionLocalStorage('preferAccountType', updatedPreferAccountType);
  }
}

async function patchDukongPreferAccountTypeMismatching() {
  const storedPreferAccountType = await getExtensionLocalStorage('preferAccountType');
  const paramsV11 = await getExtensionLocalStorage('paramsV11');
  const userAccounts = await getExtensionLocalStorage('userAccounts');

  if (!storedPreferAccountType || Object.keys(storedPreferAccountType).length === 0 || !paramsV11 || !userAccounts) {
    return;
  }

  let hasChanges = false;
  const updated = produce(storedPreferAccountType, (draft) => {
    for (const id in draft) {
      const chains = draft[id];
      const mantra = chains?.['mantra-testnet'];

      if (mantra && mantra.pubkeyType === '/ethermint.crypto.v1.ethsecp256k1.PubKey') {
        mantra.pubkeyType = '/cosmos.evm.crypto.v1.ethsecp256k1.PubKey';
        hasChanges = true;
      }
    }
  });

  if (hasChanges) {
    await setExtensionLocalStorage('preferAccountType', updated);
  }
}
async function initializePreferAccountType() {
  const storedPreferAccountType = await getExtensionLocalStorage('preferAccountType');
  const paramsV11 = await getExtensionLocalStorage('paramsV11');
  const userAccounts = await getExtensionLocalStorage('userAccounts');

  if (
    userAccounts &&
    userAccounts.length > 0 &&
    paramsV11 &&
    (!storedPreferAccountType || (storedPreferAccountType && Object.keys(storedPreferAccountType).length < 1))
  ) {
    const formattedMulitpleAccountTypesParams = Object.entries(paramsV11)
      .filter((item) => {
        const accountType = item[1].params.chainlist_params?.account_type;
        return accountType && accountType.length > 1;
      })
      .map((item) => {
        const v11Param = item[1];
        return {
          apiId: item[0],
          ...v11Param,
        };
      });

    const defaultPreferAccountType = formattedMulitpleAccountTypesParams.reduce((acc: ChainToAccountTypeMap, cur) => {
      const defaultAccountType = cur.params.chainlist_params?.account_type?.find((type) => type.is_default !== false);

      if (defaultAccountType) {
        const type = {
          hdPath: defaultAccountType.hd_path.replace('X', '${index}'),
          pubkeyStyle: defaultAccountType.pubkey_style,
          isDefault: defaultAccountType.is_default,
          pubkeyType: defaultAccountType.pubkey_type,
        };

        acc[cur.apiId] = type;
      }

      return acc;
    }, {});

    const updatedPreferAccountType = userAccounts.reduce((acc: PreferAccountType, cur) => {
      acc[cur.id] = defaultPreferAccountType;
      return acc;
    }, {});

    await setExtensionLocalStorage('preferAccountType', updatedPreferAccountType);
  }
}
