import { browser } from 'wxt/browser';
import { type Browser } from 'wxt/browser';

import { extension } from '../browser';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

export function getWindow(windowId: number): Promise<Browser.windows.Window | undefined> {
  return new Promise((res, rej) => {
    void browser.windows.getAll((windows) => {
      if (extension.runtime.lastError) {
        rej(extension.runtime.lastError);
      }

      const specificWindow = windows.find((window) => window.id === windowId);
      res(specificWindow);
    });
  });
}

export function getCurrentWindowInfo(): Promise<Browser.windows.Window | undefined> {
  return new Promise((res, rej) => {
    void browser.windows.getCurrent((windows) => {
      if (browser.runtime.lastError) {
        rej(browser.runtime.lastError);
      }

      res(windows);
    });
  });
}

export async function closeWindow(id?: number): Promise<void> {
  const windowId = typeof id === 'number' ? id : await getExtensionLocalStorage('currentWindowId');
  await setExtensionLocalStorage('currentWindowId', null);

  const currentWindow = windowId ? await getWindow(windowId) : undefined;

  return new Promise((res, rej) => {
    if (!currentWindow?.id) {
      res();
      return;
    }

    void extension.windows.remove(currentWindow.id, () => {
      if (extension.runtime.lastError) {
        rej(extension.runtime.lastError);
      }

      res();
    });
  });
}
