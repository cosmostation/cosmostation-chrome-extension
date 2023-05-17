export async function openTab(path?: string): Promise<chrome.tabs.Tab> {
  const url = chrome.runtime.getURL(`popup.html${path ? `#${path}` : ''}`);

  return new Promise((res, rej) => {
    chrome.tabs.create({ active: true, url }, (tab) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }

      res(tab);
    });
  });
}

export async function closeTab(id?: number): Promise<void> {
  const currentTabId = id || (await getCurrentTab()).id;

  return new Promise((res, rej) => {
    if (!currentTabId) {
      res();
      return;
    }

    void chrome.tabs.remove(currentTabId, () => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }

      res();
    });
  });
}

export function getCurrent(): Promise<chrome.tabs.Tab | undefined> {
  return new Promise((res, rej) => {
    chrome.tabs.getCurrent((tab) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }

      res(tab);
    });
  });
}

export async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);

  const origin = tab?.url ? new URL(tab.url).origin : undefined;
  return { ...tab, origin };
}
