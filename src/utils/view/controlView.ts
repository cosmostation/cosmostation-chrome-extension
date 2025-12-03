import type { Browser } from 'wxt/browser';
import { browser } from 'wxt/browser';

import { isSidePanelView } from './sidepanel';
import { getCurrentExtensionTabInfo } from './tab';
import { getCurrentWindowInfo, getWindow } from './window';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

export function setSidePanelWithDefaultView(path?: string) {
  openSidePanel(path);

  browser.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });

  window.close();
}

export function setPopupAsDefaultView() {
  browser.sidePanel.setPanelBehavior({
    openPanelOnActionClick: false,
  });

  if (isSidePanelView()) {
    closeSidePanel();
  }
}

export async function openSidePanel(path?: string) {
  const currentWindow = await getCurrentWindowInfo();

  const windowId = currentWindow?.id;

  if (!windowId) {
    return;
  }

  const currentPath = `sidepanel.html${path ? `#${path}` : ''}`;

  if (!browser.sidePanel) {
    return;
  }

  browser.sidePanel.setOptions({
    path: currentPath,
    enabled: true,
  });

  browser.sidePanel.open({ windowId });
}

export function closeSidePanel() {
  window.close();
}

export async function openTab(path?: string) {
  const currentTab = await getCurrentExtensionTabInfo();

  const currentWindow = await getCurrentWindowInfo();

  if (currentTab && currentWindow?.type !== 'popup') {
    return;
  } else {
    const url = browser.runtime.getURL(`/popup.html${path ? `#${path}` : ''}`);

    browser.tabs.create({ active: true, url });
  }
}

export async function closeTab(id?: number): Promise<void> {
  const currentTabId = id || (await getCurrentExtensionTabInfo())?.id;

  if (!currentTabId) {
    return;
  }

  browser.tabs.remove(currentTabId);
}

export async function openPopupWindow(): Promise<Browser.windows.Window | undefined> {
  const url = browser.runtime.getURL('/popup.html');

  const queues = await getExtensionLocalStorage('requestQueue');

  const currentWindowIds = queues.filter((item) => typeof item.windowId === 'number').map((item) => item.windowId) as number[];

  const currentWindowId = await getExtensionLocalStorage('currentWindowId');

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

  const width = 375;
  const height = 640;

  let left = 0;
  let top = 0;

  try {
    const res = await browser.windows.getLastFocused();

    if (res.width && res.left !== undefined) {
      left = Math.round(res.width - width + res.left);
    }
    if (res.top !== undefined) {
      top = res.top;
    }
  } catch (e) {
    console.error(`Failed to determine popup position: ${(e as Error)?.message ?? e}`);
  }

  return new Promise((res, rej) => {
    if (currentWindows.length > 0) {
      res(currentWindows[0]);
      if (currentWindows[0]?.id) {
        void browser.windows.update(currentWindows[0].id, { focused: true });
      }
      return;
    }

    browser.windows.create({ width, height, top, left, url, type: 'popup' }, (window) => {
      void (async () => {
        if (browser.runtime.lastError) {
          rej(browser.runtime.lastError);
        }
        await setExtensionLocalStorage('currentWindowId', window?.id ?? null);
        res(window);
      })();
    });
  });
}

export async function closePopupWindow() {
  const currentWindow = await getCurrentWindowInfo();

  if (currentWindow?.type !== 'popup' || !currentWindow.id) {
    return;
  }

  browser.windows.remove(currentWindow.id);
}
