import { aesDecrypt } from '~/Popup/utils/crypto';
import type { ChromeSessionStorage, ChromeSessionStorageKeys } from '~/types/extensionStorage';

export function getSessionStorage<T extends ChromeSessionStorageKeys>(key: T): Promise<ChromeSessionStorage[T]> {
  return new Promise((res, rej) => {
    chrome.storage.session.get(key, (items) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res((items ? items[key] : undefined) as ChromeSessionStorage[T]);
    });
  });
}

export function getAllSessionStorage(): Promise<ChromeSessionStorage> {
  return new Promise((res, rej) => {
    chrome.storage.session.get(null, (items) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res(items as ChromeSessionStorage);
    });
  });
}

export function setSessionStorage<T extends ChromeSessionStorageKeys>(key: T, value: ChromeSessionStorage[T]): Promise<true> {
  return new Promise((res, rej) => {
    chrome.storage.session.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res(true);
    });
  });
}

export async function chromeSessionStorage() {
  const storage = await getAllSessionStorage();

  const currentPassword = storage.password ? aesDecrypt(storage.password.value, `${storage.password.key}${storage.password.time}`) : null;

  return {
    ...storage,
    currentPassword,
  };
}
