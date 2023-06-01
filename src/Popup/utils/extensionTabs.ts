import { debounce } from 'lodash';

import { extension } from '~/Popup/utils/extension';

import { getCurrentWindow } from './extensionWindows';

export async function openTab(path?: string): Promise<chrome.tabs.Tab | browser.tabs.Tab> {
  const currentTab = await getCurrent();
  const currentWindow = await getCurrentWindow();

  const url = extension.runtime.getURL(`popup.html${path ? `#${path}` : ''}`);

  return new Promise((res, rej) => {
    if (currentTab && currentWindow?.type !== 'popup') {
      res(currentTab);
      return;
    }

    void extension.tabs.create({ active: true, url }, (tab) => {
      if (extension.runtime.lastError) {
        rej(extension.runtime.lastError);
      }

      res(tab);
    });
  });
}

export const debouncedOpenTab = debounce(openTab, 100);

export async function closeTab(id?: number): Promise<void> {
  const currentTabId = id || (await getCurrent())?.id;

  return new Promise((res, rej) => {
    if (!currentTabId) {
      res();
      return;
    }

    void extension.tabs.remove(currentTabId, () => {
      if (extension.runtime.lastError) {
        rej(extension.runtime.lastError);
      }

      res();
    });
  });
}

export function getCurrent(): Promise<chrome.tabs.Tab | browser.tabs.Tab | undefined> {
  return new Promise((res, rej) => {
    void extension.tabs.getCurrent((tab) => {
      if (extension.runtime.lastError) {
        rej(extension.runtime.lastError);
      }

      res(tab);
    });
  });
}

export async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await extension.tabs.query(queryOptions);

  const origin = tab?.url ? new URL(tab.url).origin : undefined;
  return { ...tab, origin };
}
