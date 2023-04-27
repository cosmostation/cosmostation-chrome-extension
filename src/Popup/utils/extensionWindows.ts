import { extension } from '~/Popup/utils/extension';

import { getStorage, setStorage } from './extensionStorage';

export async function openWindow(): Promise<chrome.windows.Window | browser.windows.Window | undefined> {
  const url = extension.runtime.getURL('popup.html');

  const queues = await getStorage('queues');

  const currentWindowIds = queues.filter((item) => typeof item.windowId === 'number').map((item) => item.windowId) as number[];

  const currentWindowId = await getStorage('windowId');

  if (typeof currentWindowId === 'number') {
    currentWindowIds.push(currentWindowId);
  }

  const windowIds = Array.from(new Set(currentWindowIds));

  const currentWindows = (
    await Promise.all(
      windowIds.map(async (item) => {
        const window = await getWindow(item);
        return window;
      }),
    )
  ).filter((item) => item !== undefined);

  return new Promise((res, rej) => {
    if (currentWindows.length > 0) {
      res(currentWindows[0]);
      if (currentWindows[0]?.id) {
        void extension.windows.update(currentWindows[0].id, { focused: true });
      }
      return;
    }

    void extension.windows.create({ width: 375, height: 640, url, type: 'popup' }).then((window) => {
      void (async () => {
        if (extension.runtime.lastError) {
          rej(extension.runtime.lastError);
        }
        await setStorage('windowId', window?.id ?? null);
        res(window);
      })();
    });
  });
}

export async function closeWindow(id?: number): Promise<void> {
  const windowId = typeof id === 'number' ? id : await getStorage('windowId');
  await setStorage('windowId', null);

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

export function getWindow(windowId: number): Promise<chrome.windows.Window | browser.windows.Window | undefined> {
  return new Promise((res, rej) => {
    if (process.env.BROWSER === 'chrome') {
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

export function getCurrentWindow(): Promise<chrome.windows.Window | browser.windows.Window | undefined> {
  return new Promise((res, rej) => {
    if (process.env.BROWSER === 'chrome') {
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
