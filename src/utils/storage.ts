import { DefaultSortKey } from '@/constants/initialStorage';
import type { ExtensionSessionStorage, ExtensionSessionStorageKeys, ExtensionStorage, ExtensionStorageKeys } from '@/types/extension';

import { extension } from './browser';
import { aesDecrypt } from './crypto';

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

  const currentPassword = storage.password ? aesDecrypt(storage.password.encryptedPassword, `${storage.password.key}${storage.password.timestamp}`) : null;

  return {
    ...storage,
    currentPassword,
  };
}
