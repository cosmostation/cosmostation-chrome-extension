import { isSidePanelView } from './sidepanel';
import { getCurrentExtensionTabInfo } from './tab';
import { getCurrentWindowInfo } from './window';
import { extension } from '../browser';

export function setSidePanelWithDefaultView(path?: string) {
  openSidePanel(path);

  if (__APP_BROWSER__ === 'chrome') {
    chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: true,
    });
  }

  window.close();
}

export function setPopupAsDefaultView() {
  if (__APP_BROWSER__ === 'chrome') {
    chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: false,
    });
  }

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

  if (__APP_BROWSER__ === 'chrome') {
    if (!chrome.sidePanel) {
      return;
    }

    chrome.sidePanel.setOptions({
      path: currentPath,
      enabled: true,
    });

    chrome.sidePanel.open({ windowId });
  } else {
    browser.sidebarAction.setPanel({
      panel: currentPath,
    });

    browser.sidebarAction.open();
  }
}

export function closeSidePanel() {
  if (__APP_BROWSER__ === 'chrome') {
    window.close();
  } else {
    browser.sidebarAction.close();
  }
}

export async function openTab(path?: string) {
  const currentTab = await getCurrentExtensionTabInfo();

  const currentWindow = await getCurrentWindowInfo();

  if (currentTab && currentWindow?.type !== 'popup') {
    return;
  } else {
    const url = extension.runtime.getURL(`popup.html${path ? `#${path}` : ''}`);

    extension.tabs.create({ active: true, url });
  }
}

export async function closeTab(id?: number): Promise<void> {
  const currentTabId = id || (await getCurrentExtensionTabInfo())?.id;

  if (!currentTabId) {
    return;
  }

  extension.tabs.remove(currentTabId);
}

export async function openPopupWindow(): Promise<chrome.windows.Window | browser.windows.Window | undefined> {
  const url = extension.runtime.getURL('popup.html');

  return new Promise((res, rej) => {
    const width = 375;
    const height = 640;

    if (__APP_BROWSER__ === 'chrome') {
      chrome.windows.create({ width, height, url, type: 'popup' }, (window) => {
        void (async () => {
          if (extension.runtime.lastError) {
            rej(extension.runtime.lastError);
          }
          res(window);
        })();
      });
    } else {
      void browser.windows.create({ width, height, url, type: 'popup' }).then((window) => {
        void (async () => {
          if (extension.runtime.lastError) {
            rej(extension.runtime.lastError);
          }
          res(window);
        })();
      });
    }
  });
}

export async function closePopupWindow() {
  const currentWindow = await getCurrentWindowInfo();

  if (currentWindow?.type !== 'popup' || !currentWindow.id) {
    return;
  }

  if (__APP_BROWSER__ === 'chrome') {
    chrome.windows.remove(currentWindow.id);
  } else {
    browser.windows.remove(currentWindow.id);
  }
}
