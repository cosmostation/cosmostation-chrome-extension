export async function openTab(path?: string): Promise<chrome.tabs.Tab> {
  const url = chrome.runtime.getURL(`popup.html${path ? `#${path}` : ''}`);

  const currentTab = await getCurrentTab();

  return new Promise((res, rej) => {
    if (currentTab) {
      res(currentTab);
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

export function getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
  return new Promise((res, rej) => {
    chrome.tabs.getCurrent((tab) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }

      res(tab);
    });
  });
}
