import { aesDecrypt } from '~/Popup/utils/crypto';
import type { ExtensionSessionStorage, ExtensionSessionStorageKeys } from '~/types/extensionStorage';

export function getSessionStorage<T extends ExtensionSessionStorageKeys>(key: T): Promise<ExtensionSessionStorage[T]> {
  return new Promise((res, rej) => {
    chrome.storage.session.get(key, (items) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res((items ? items[key] : undefined) as ExtensionSessionStorage[T]);
    });
  });
}

export function getAllSessionStorage(): Promise<ExtensionSessionStorage> {
  return new Promise((res, rej) => {
    chrome.storage.session.get(null, (items) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res(items as ExtensionSessionStorage);
    });
  });
}

export function setSessionStorage<T extends ExtensionSessionStorageKeys>(key: T, value: ExtensionSessionStorage[T]): Promise<true> {
  return new Promise((res, rej) => {
    chrome.storage.session.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res(true);
    });
  });
}

export async function extensionSessionStorage() {
  const storage = await getAllSessionStorage();

  const currentPassword = storage.password ? aesDecrypt(storage.password.value, `${storage.password.key}${storage.password.time}`) : null;

  return {
    ...storage,
    currentPassword,
  };
}
