import { extension } from '../browser';

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
