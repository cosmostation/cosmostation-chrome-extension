import { getStorage, setStorage } from './chromeStorage';

export async function openWindow(): Promise<chrome.windows.Window | undefined> {
  const url = chrome.runtime.getURL('popup.html');

  const windowId = await getStorage('windowId');

  const currentWindow = windowId ? await getWindow(windowId) : undefined;

  return new Promise((res, rej) => {
    if (currentWindow) {
      res(currentWindow);
      return;
    }

    chrome.windows.create({ width: 360, height: 620, url, type: 'popup' }, (window) => {
      void (async function async() {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        }
        await setStorage('windowId', window?.id ?? null);
        res(window);
      })();
    });
  });
}

export async function closeWindow(): Promise<void> {
  const windowId = await getStorage('windowId');

  const currentWindow = windowId ? await getWindow(windowId) : undefined;

  return new Promise((res, rej) => {
    if (!currentWindow?.id) {
      res();
      return;
    }

    chrome.windows.remove(currentWindow.id, () => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }

      res();
    });
  });
}

export function getWindow(windowId: number): Promise<chrome.windows.Window | undefined> {
  return new Promise((res, rej) => {
    chrome.windows.getAll((windows) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }

      const specificWindow = windows.find((window) => window.id === windowId);
      res(specificWindow);
    });
  });
}
