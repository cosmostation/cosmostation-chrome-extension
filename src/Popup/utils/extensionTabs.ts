import { extension } from '~/Popup/utils/extension';

export async function openTab(path?: string): Promise<chrome.tabs.Tab | browser.tabs.Tab> {
  const url = extension.runtime.getURL(`popup.html${path ? `#${path}` : ''}`);

  const current = await getCurrent();

  return new Promise((res, rej) => {
    if (current) {
      res(current);
    } else {
      chrome.tabs.create({ active: true, url }, (tab) => {
        if (chrome.runtime.lastError) {
          rej(chrome.runtime.lastError);
        }

        res(tab);
      });
    }
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
