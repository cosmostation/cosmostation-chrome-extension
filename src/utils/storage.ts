import { produce } from 'immer';

import { CURRENCY_TYPE } from '@/constants/currency';
import { DefaultSortKey } from '@/constants/initialStorage';
import { PRICE_TREND_TYPE } from '@/constants/price';
import { getChains } from '@/libs/chain';
import { v11 } from '@/script/service-worker/update/v11';
import type { Account, AccountNamesById, ChainToAccountTypeMap, PreferAccountType } from '@/types/account';
import type { ExtensionSessionStorage, ExtensionSessionStorageKeys, ExtensionStorage, ExtensionStorageKeys, PrioritizedProvider } from '@/types/extension';

import { extension } from './browser';
import { isNil } from './common';
import { aesDecrypt } from './crypto';
import { getUniqueChainId } from './queryParamGenerator';

export async function setExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T, value: ExtensionStorage[T]) {
  await extension.storage.local.set({ [key]: value as ExtensionStorage[T] });
}

export async function getExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T) {
  const localStorage = await extension.storage.local.get(key);

  return localStorage[key] as ExtensionStorage[T];
}

export const deleteKeysContainingString = async (searchString: string): Promise<void> => {
  chrome.storage.local.get(null, (items) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    const keysToDelete = Object.keys(items).filter((key) => key.includes(searchString));

    if (keysToDelete.length > 0) {
      chrome.storage.local.remove(keysToDelete, () => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
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

export async function setMultipleExtensionLocalStorage(data: Partial<ExtensionStorage>) {
  await extension.storage.local.set(data);
}

export async function getMultipleFromExtensionStorage<T extends ExtensionStorageKeys>(keys: T[]) {
  const localStorage = await extension.storage.local.get(keys);

  return localStorage as Pick<ExtensionStorage, T>;
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
type Updates = Partial<ExtensionStorage>;

const INITIAL_STORAGE_STATE = {
  paramsV11: {},
  assetsV11: [],
  userCurrencyPreference: CURRENCY_TYPE.USD,
  userPriceTrendPreference: PRICE_TREND_TYPE.GREEN_UP,
  dappListSortKey: DefaultSortKey.dappListSortKey,
  dashboardCoinSortKey: DefaultSortKey.dashboardCoinSortKey,
  chainListSortKey: DefaultSortKey.chainListSortKey,
  userAccounts: [],
  accountNamesById: {},
  mnemonicNamesByHashedMnemonic: {},
  notBackedUpAccountIds: [],
  preferAccountType: {},
  customErc20Assets: [],
  customCw20Assets: [],
  addressBookList: [],
  addedCustomChainList: [],
  customAssets: [],
  customHiddenAssetIds: [],
  approvedOrigins: [],
  requestQueue: [],
  approvedSuiPermissions: [],
  approvedIotaPermissions: [],
  initCheckLegacyBalanceAccountIds: [],
  isBalanceVisible: true,
  isHideSmalValue: false,
  currentWindowId: null,
  prioritizedProvider: {
    aptos: false,
    keplr: false,
    metamask: false,
  },
  pinnedDappIds: [],
  autoLockTimeInMinutes: '30' as const,
  adPopoverState: {},
} satisfies Partial<ExtensionStorage>;

type InitialStorageKeys = keyof typeof INITIAL_STORAGE_STATE;

function applyStorageDefaults(snapshot: Partial<ExtensionStorage>, updates: Updates) {
  const storageKeys = Object.keys(INITIAL_STORAGE_STATE) as InitialStorageKeys[];

  for (const key of storageKeys) {
    const currentValue = snapshot[key];
    const defaultValue = INITIAL_STORAGE_STATE[key];

    const shouldApplyDefault =
      key === 'isBalanceVisible' || key === 'isHideSmalValue' ? isNil(currentValue) : currentValue === undefined || currentValue === null;

    if (shouldApplyDefault) {
      (updates as Record<string, unknown>)[key] = defaultValue;
      (snapshot as Record<string, unknown>)[key] = defaultValue;
    }
  }

  const p = snapshot.prioritizedProvider;
  if (p && (p.aptos === undefined || p.metamask === undefined || p.keplr === undefined)) {
    const defaultProvider = INITIAL_STORAGE_STATE.prioritizedProvider;
    const newProviders: PrioritizedProvider = {
      aptos: p.aptos ?? defaultProvider.aptos,
      keplr: p.keplr ?? defaultProvider.keplr,
      metamask: p.metamask ?? defaultProvider.metamask,
    };
    updates.prioritizedProvider = newProviders;
    snapshot.prioritizedProvider = newProviders;
  }
}

export async function initExtensionLocalStorage() {
  const keysToFetch = [
    ...Object.keys(INITIAL_STORAGE_STATE),

    'chosenEthereumNetworkId',
    'chosenAptosNetworkId',
    'chosenSuiNetworkId',
    'chosenBitcoinNetworkId',
    'chosenIotaNetworkId',
    'chosenSolanaNetworkId',
    'chosenGnoNetworkId',
    'currentAccountId',
  ] as const;

  const uniqueKeys = Array.from(new Set(keysToFetch)) as ExtensionStorageKeys[];

  let snapshot = await getMultipleFromExtensionStorage(uniqueKeys);

  if (!snapshot.paramsV11 || !snapshot.assetsV11) {
    await v11();
    snapshot = await getMultipleFromExtensionStorage(uniqueKeys);
  }

  const updates: Updates = {};

  applyStorageDefaults(snapshot, updates);

  const chains = await getChains();
  const chosenNetworkUpdates = computeChosenNetworkUpdates(snapshot, chains);
  Object.assign(updates, chosenNetworkUpdates);
  Object.assign(snapshot, chosenNetworkUpdates);

  Object.assign(updates, computeCurrentAccountId(snapshot));
  Object.assign(snapshot, updates);

  Object.assign(updates, computeMissingAccountNames(snapshot));
  Object.assign(snapshot, updates);

  Object.assign(updates, computeMissingMnemonicNames(snapshot));
  Object.assign(snapshot, updates);

  Object.assign(updates, computeSetMissingPreferAccountType(snapshot));
  Object.assign(snapshot, updates);

  Object.assign(updates, computeInitializePreferAccountType(snapshot));
  Object.assign(snapshot, updates);

  Object.assign(updates, computePatchDukongPreferAccountType(snapshot));
  Object.assign(snapshot, updates);

  if (Object.keys(updates).length > 0) {
    await setMultipleExtensionLocalStorage(updates);
  }
}

function computeChosenNetworkUpdates(
  snapshot: Pick<
    ExtensionStorage,
    | 'chosenEthereumNetworkId'
    | 'chosenAptosNetworkId'
    | 'chosenSuiNetworkId'
    | 'chosenBitcoinNetworkId'
    | 'chosenIotaNetworkId'
    | 'chosenSolanaNetworkId'
    | 'chosenGnoNetworkId'
  >,
  chains: Awaited<ReturnType<typeof getChains>>,
): Updates {
  const updates: Updates = {};
  const { evmChains, aptosChains, suiChains, bitcoinChains, iotaChains, solanaChains, gnoChains } = chains;

  if (!snapshot.chosenEthereumNetworkId) {
    const d = evmChains.find((c) => c.id === 'ethereum') || evmChains[0];
    updates.chosenEthereumNetworkId = getUniqueChainId(d);
  }
  if (!snapshot.chosenAptosNetworkId) {
    const d = aptosChains.find((c) => c.id === 'aptos') || aptosChains[0];
    updates.chosenAptosNetworkId = getUniqueChainId(d);
  }
  if (!snapshot.chosenSuiNetworkId) {
    const d = suiChains.find((c) => c.id === 'sui') || suiChains[0];
    updates.chosenSuiNetworkId = getUniqueChainId(d);
  }
  if (!snapshot.chosenBitcoinNetworkId) {
    const d = bitcoinChains.find((c) => c.id === 'bitcoin') || bitcoinChains[0];
    updates.chosenBitcoinNetworkId = getUniqueChainId(d);
  }
  if (!snapshot.chosenIotaNetworkId && iotaChains.length > 0) {
    const d = iotaChains.find((c) => c.id === 'iota') || iotaChains[0];
    updates.chosenIotaNetworkId = getUniqueChainId(d);
  }
  if (!snapshot.chosenSolanaNetworkId && solanaChains.length > 0) {
    const d = solanaChains.find((c) => c.id === 'solana') || solanaChains[0];
    updates.chosenSolanaNetworkId = getUniqueChainId(d);
  }
  if (!snapshot.chosenGnoNetworkId) {
    const d = gnoChains.find((c) => c.id === 'gno') || gnoChains[0];
    updates.chosenGnoNetworkId = getUniqueChainId(d);
  }

  return updates;
}

function computeCurrentAccountId(snapshot: Pick<ExtensionStorage, 'userAccounts' | 'currentAccountId'>): Updates {
  const updates: Updates = {};

  const storedCurrent = snapshot.currentAccountId;
  const accounts = snapshot.userAccounts ?? [];
  const defaultAccountId = storedCurrent || (accounts.length > 0 ? accounts[0]?.id || '' : '');

  updates.currentAccountId = defaultAccountId;

  return updates;
}

function computeMissingMnemonicNames(snapshot: Pick<ExtensionStorage, 'mnemonicNamesByHashedMnemonic' | 'userAccounts'>): Updates {
  const updates: Updates = {};
  const mnemonicNamesStorage = snapshot.mnemonicNamesByHashedMnemonic;
  const userAccounts = snapshot.userAccounts;

  if (!mnemonicNamesStorage || !userAccounts || userAccounts.length === 0) return updates;

  const mnemonicNameKeys = Object.keys(mnemonicNamesStorage);
  const missing = userAccounts.filter((a) => a.type === 'MNEMONIC').filter((a) => !mnemonicNameKeys.includes(a.encryptedRestoreString));

  if (missing.length === 0) return updates;

  const total = mnemonicNameKeys.length;
  const unique = [...new Set(missing.map((a) => a.encryptedRestoreString))];

  const added = unique.reduce((acc: AccountNamesById, cur, i) => {
    acc[cur] = `Mnemonic ${total + i + 1}`;
    return acc;
  }, {} as AccountNamesById);

  updates.mnemonicNamesByHashedMnemonic = { ...mnemonicNamesStorage, ...added };
  return updates;
}

function computeMissingAccountNames(snapshot: Pick<ExtensionStorage, 'accountNamesById' | 'userAccounts'>): Updates {
  const updates: Updates = {};
  const userAccounts = snapshot.userAccounts;
  const accountNameMap = snapshot.accountNamesById;

  if (!accountNameMap || !userAccounts || userAccounts.length === 0) return updates;

  const keys = Object.keys(accountNameMap);
  const missing = userAccounts.filter((a) => !keys.includes(a.id));
  if (missing.length === 0) return updates;

  const total = keys.length;
  const unique = [...new Set(missing.map((a) => a.id))];

  const added = unique.reduce((acc: AccountNamesById, cur, i) => {
    acc[cur] = `Account ${total + i + 1}`;
    return acc;
  }, {} as AccountNamesById);

  updates.accountNamesById = { ...accountNameMap, ...added };
  return updates;
}

function computeSetMissingPreferAccountType(snapshot: Pick<ExtensionStorage, 'preferAccountType' | 'paramsV11' | 'userAccounts'>): Updates {
  const updates: Updates = {};
  const storedPrefer = snapshot.preferAccountType;
  const paramsV11 = snapshot.paramsV11;
  const userAccounts = snapshot.userAccounts;

  if (!storedPrefer || Object.keys(storedPrefer).length < 1 || !paramsV11 || !userAccounts) return updates;

  const chainInfos = Object.entries(paramsV11).map(([id, v]) => ({ id, ...v }));
  const filtered = chainInfos.filter((c) => c.params.chainlist_params?.account_type?.length && c.params.chainlist_params?.account_type?.length > 1);
  const freshNames = filtered.map((c) => c.id);

  const sample = Object.values(storedPrefer)[0];
  const notStored = freshNames.filter((name) => (sample ? !Object.keys(sample).includes(name) : true)).filter(Boolean);

  if (notStored.length === 0) return updates;

  const newPreferAccountType: ChainToAccountTypeMap = {};
  for (const apiName of notStored) {
    const acctTypes = filtered.find((c) => c.params.chainlist_params?.api_name === apiName)?.params.chainlist_params?.account_type;
    const def = acctTypes?.find((t) => t.is_default !== false);
    if (!def) continue;
    newPreferAccountType[apiName] = {
      hdPath: def.hd_path.replace('X', '${index}'),
      pubkeyStyle: def.pubkey_style,
      isDefault: def.is_default,
      pubkeyType: def.pubkey_type,
    };
  }

  if (Object.keys(newPreferAccountType).length === 0) return updates;

  const updatedPrefer = userAccounts.reduce((acc: PreferAccountType, cur: Account) => {
    const old = storedPrefer[cur.id] ?? {};
    acc[cur.id] = { ...old, ...newPreferAccountType };
    return acc;
  }, {} as PreferAccountType);

  updates.preferAccountType = updatedPrefer;
  return updates;
}

function computeInitializePreferAccountType(snapshot: Pick<ExtensionStorage, 'preferAccountType' | 'paramsV11' | 'userAccounts'>): Updates {
  const updates: Updates = {};
  const storedPrefer = snapshot.preferAccountType;
  const paramsV11 = snapshot.paramsV11;
  const userAccounts = snapshot.userAccounts;

  const shouldInit = userAccounts && userAccounts.length > 0 && paramsV11 && (!storedPrefer || Object.keys(storedPrefer).length < 1);

  if (!shouldInit) return updates;

  const multi = Object.entries(paramsV11)
    .filter(([, v]) => (v.params.chainlist_params?.account_type?.length ?? 0) > 1)
    .map(([apiId, v]) => ({ apiId, ...v }));

  const defaultMap = multi.reduce((acc: ChainToAccountTypeMap, cur) => {
    const def = cur.params.chainlist_params?.account_type?.find((t) => t.is_default !== false);
    if (!def) return acc;
    acc[cur.apiId] = {
      hdPath: def.hd_path.replace('X', '${index}'),
      pubkeyStyle: def.pubkey_style,
      isDefault: def.is_default,
      pubkeyType: def.pubkey_type,
    };
    return acc;
  }, {} as ChainToAccountTypeMap);

  const updatedPrefer = userAccounts.reduce((acc: PreferAccountType, cur: Account) => {
    acc[cur.id] = defaultMap;
    return acc;
  }, {} as PreferAccountType);

  updates.preferAccountType = updatedPrefer;
  return updates;
}

function computePatchDukongPreferAccountType(snapshot: Pick<ExtensionStorage, 'preferAccountType' | 'paramsV11' | 'userAccounts'>): Updates {
  const updates: Updates = {};
  const storedPrefer = snapshot.preferAccountType;
  const paramsV11 = snapshot.paramsV11;
  const userAccounts = snapshot.userAccounts;

  if (!storedPrefer || Object.keys(storedPrefer).length === 0 || !paramsV11 || !userAccounts) return updates;

  let hasChanges = false;
  const patched = produce(storedPrefer, (draft) => {
    for (const id in draft) {
      const mantra = draft[id]?.['mantra-testnet'];
      if (mantra && mantra.pubkeyType === '/ethermint.crypto.v1.ethsecp256k1.PubKey') {
        mantra.pubkeyType = '/cosmos.evm.crypto.v1.ethsecp256k1.PubKey';
        hasChanges = true;
      }
    }
  });

  if (hasChanges) updates.preferAccountType = patched;
  return updates;
}
