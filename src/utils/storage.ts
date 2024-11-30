import { produce } from 'immer';

import { DefaultSortKey } from '@/constants/initialStorage';
import type { ExtensionStorage, ExtensionStorageKeys } from '@/types/extension';

import { extension } from './browser';

export async function initExtensionLocalStorage() {
  const originStorage = await getAllExtensionLocalStorage();

  if (!originStorage.language) {
    setExtensionLocalStorage('language', 'en');
  }

  if (!originStorage.dappListSortKey) {
    setExtensionLocalStorage('dappListSortKey', DefaultSortKey.dappListSortKey);
  }

  if (!originStorage.dashboardCoinSortKey) {
    setExtensionLocalStorage('dashboardCoinSortKey', DefaultSortKey.dashboardCoinSortKey);
  }

  if (!originStorage.accounts) {
    setExtensionLocalStorage('accounts', []);
  }

  if (!originStorage.accountNamesById) {
    setExtensionLocalStorage('accountNamesById', {});
  }

  if (!originStorage.mnemonicNamesByHashedMnemonic) {
    setExtensionLocalStorage('mnemonicNamesByHashedMnemonic', {});
  }
}

export async function setExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T, value: ExtensionStorage[T]) {
  await extension.storage.local.set({ [key]: value as ExtensionStorage[T] });
}

export async function getExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T) {
  const localStorage = await extension.storage.local.get(key);

  return localStorage[key] as ExtensionStorage[T];
}

export async function getAllExtensionLocalStorage(): Promise<ExtensionStorage> {
  const localStorage = await extension.storage.local.get();

  return localStorage as ExtensionStorage;
}

export async function updateExtensionLocalStorage<T extends ExtensionStorageKeys>(key: T, data: ExtensionStorage[T]) {
  const originStorage = await getExtensionLocalStorage(key);

  const updatedStorage = produce(originStorage, (draft) => {
    Object.assign(draft, data);
  });

  setExtensionLocalStorage(key, updatedStorage);
}
