import type { ChromeStorage, ChromeStorageKeys } from '~/types/chromeStorage';

export function getStorage<T extends ChromeStorageKeys>(key: T): Promise<ChromeStorage[T]> {
  return new Promise((res, rej) => {
    chrome.storage.local.get(key, (items) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res((items ? items[key] : undefined) as ChromeStorage[T]);
    });
  });
}

export function getAllStorage(): Promise<ChromeStorage> {
  return new Promise((res, rej) => {
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res(items as ChromeStorage);
    });
  });
}

export function setStorage<T extends ChromeStorageKeys>(key: T, value: ChromeStorage[T]): Promise<true> {
  return new Promise((res, rej) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res(true);
    });
  });
}

export async function getCurrentAccount() {
  const storage = await getAllStorage();

  const { accounts, selectedAccountId } = storage;

  return accounts.find((account) => account.id === selectedAccountId) || null;
}
