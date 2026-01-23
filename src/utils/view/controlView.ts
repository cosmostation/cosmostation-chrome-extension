import type { Browser } from 'wxt/browser';
import { browser as crossBrowser } from 'wxt/browser';

import { VIEW_PREFERENCE_TYPE } from '@/constants/userPreference/view';

import { isSidePanelView } from './sidepanel';
import { getCurrentExtensionTabInfo } from './tab';
import { getCurrentWindowInfo, getWindow } from './window';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '../storage';

export async function setSidePanelWithDefaultView(path?: string) {
  if (__APP_BROWSER__ === 'firefox') {
    browser.sidebarAction.open();
    window.close();
  } else {
    openSidePanel(path);

    crossBrowser.sidePanel.setPanelBehavior({
      openPanelOnActionClick: true,
    });

    window.close();
  }

  await setExtensionLocalStorage('userViewPreference', VIEW_PREFERENCE_TYPE.SIDE_PANEL);
}

export async function setPopupAsDefaultView() {
  if (__APP_BROWSER__ === 'firefox') {
    browser.sidebarAction.close();
  } else {
    crossBrowser.sidePanel.setPanelBehavior({
      openPanelOnActionClick: false,
    });

    if (isSidePanelView()) {
      closeSidePanel();
    }
  }
  await setExtensionLocalStorage('userViewPreference', VIEW_PREFERENCE_TYPE.POPUP);
}

export async function openSidePanel(path?: string) {
  const currentWindow = await getCurrentWindowInfo();

  const windowId = currentWindow?.id;

  if (!windowId) {
    return;
  }

  const currentPath = `sidepanel.html${path ? `#${path}` : ''}`;

  if (!crossBrowser.sidePanel) {
    return;
  }

  crossBrowser.sidePanel.setOptions({
    path: currentPath,
    enabled: true,
  });

  crossBrowser.sidePanel.open({ windowId });
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
    const url = crossBrowser.runtime.getURL(`/popup.html${path ? `#${path}` : ''}`);

    crossBrowser.tabs.create({ active: true, url });
  }
}

export async function closeTab(id?: number): Promise<void> {
  const currentTabId = id || (await getCurrentExtensionTabInfo())?.id;

  if (!currentTabId) {
    return;
  }

  crossBrowser.tabs.remove(currentTabId);
}

export async function openPopupWindow(): Promise<Browser.windows.Window | undefined> {
  const url = crossBrowser.runtime.getURL('/popup.html');

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

  const width = 360;
  const height = 640;

  let left = 0;
  let top = 0;

  try {
    const res = await crossBrowser.windows.getLastFocused();

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
        void crossBrowser.windows.update(currentWindows[0].id, { focused: true });
      }
      return;
    }

    crossBrowser.windows.create({ width, height, top, left, url, type: 'popup' }, (window) => {
      void (async () => {
        if (crossBrowser.runtime.lastError) {
          rej(crossBrowser.runtime.lastError);
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

  crossBrowser.windows.remove(currentWindow.id);
}
