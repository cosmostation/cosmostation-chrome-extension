import { aesDecrypt } from '~/Popup/utils/crypto';
import type { ExtensionSessionStorage, ExtensionSessionStorageKeys } from '~/types/extensionStorage';

export async function getSessionStorage<T extends ExtensionSessionStorageKeys>(key: T): Promise<ExtensionSessionStorage[T]> {
  if (process.env.BROWSER === 'chrome') {
    return new Promise((res, rej) => {
      chrome.storage.session.get(key, (items) => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        }
        res((items ? items[key] : undefined) as ExtensionSessionStorage[T]);
      });
    });
  }
  const localStorage = await browser.storage.session.get(key);

  return localStorage[key] as ExtensionSessionStorage[T];
}

export async function getAllSessionStorage(): Promise<ExtensionSessionStorage> {
  if (process.env.BROWSER === 'chrome') {
    return new Promise((res, rej) => {
      chrome.storage.session.get(null, (items) => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        }
        res(items as ExtensionSessionStorage);
      });
    });
  }
  const localStorage = await browser.storage.session.get();

  return localStorage as ExtensionSessionStorage;
}

export async function setSessionStorage<T extends ExtensionSessionStorageKeys>(key: T, value: ExtensionSessionStorage[T]): Promise<true> {
  if (process.env.BROWSER === 'chrome') {
    return new Promise((res, rej) => {
      chrome.storage.session.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        }
        res(true);
      });
    });
  }

  await browser.storage.session.set({ [key]: value });

  return true;
}

export async function extensionSessionStorage() {
  const storage = await getAllSessionStorage();

  const currentPassword = storage.password ? aesDecrypt(storage.password.value, `${storage.password.key}${storage.password.time}`) : null;

  return {
    ...storage,
    currentPassword,
  };
}
