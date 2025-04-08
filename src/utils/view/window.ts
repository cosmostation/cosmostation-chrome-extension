import { extension } from '../browser';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

export function getWindow(windowId: number): Promise<chrome.windows.Window | browser.windows.Window | undefined> {
  return new Promise((res, rej) => {
    if (__APP_BROWSER__ === 'chrome') {
      void chrome.windows.getAll((windows) => {
        if (extension.runtime.lastError) {
          rej(extension.runtime.lastError);
        }

        const specificWindow = windows.find((window) => window.id === windowId);
        res(specificWindow);
      });
    } else {
      void browser.windows.getAll().then((windows) => {
        if (extension.runtime.lastError) {
          rej(extension.runtime.lastError);
        }

        const specificWindow = windows.find((window) => window.id === windowId);
        res(specificWindow);
      });
    }
  });
}

export function getCurrentWindowInfo(): Promise<chrome.windows.Window | browser.windows.Window | undefined> {
  return new Promise((res, rej) => {
    if (__APP_BROWSER__ === 'chrome') {
      void chrome.windows.getCurrent((windows) => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        }

        res(windows);
      });
    } else {
      void browser.windows.getCurrent().then((windows) => {
        if (browser.runtime.lastError) {
          rej(browser.runtime.lastError);
        }

        res(windows);
      });
    }
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
