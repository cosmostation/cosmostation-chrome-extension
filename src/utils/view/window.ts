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
