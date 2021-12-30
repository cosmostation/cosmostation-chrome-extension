export function persistent() {
  let lifeline: chrome.runtime.Port | null;

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'keepAlive') {
      console.log('keepAlive onConnect listener');
      lifeline = port;
      setTimeout(() => {
        void (async function async() {
          void (await keepAliveForced());
        })();
      }, 295e3); // 5 minutes minus 5 seconds
      port.onDisconnect.addListener(() => {
        void (async function async() {
          void (await keepAliveForced());
        })();
      });
    }
  });

  async function keepAliveForced() {
    lifeline?.disconnect();
    lifeline = null;
    void (await keepAlive());
  }

  async function keepAlive() {
    if (lifeline) return;

    // eslint-disable-next-line no-restricted-syntax
    for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          // eslint-disable-next-line no-loop-func
          func: () => chrome.runtime.connect({ name: 'keepAlive' }),
        });
        chrome.tabs.onUpdated.removeListener((tabId, changeInfo) => {
          void (async function async() {
            await retryOnTabUpdate(tabId, changeInfo);
          })();
        });
        return;
      } catch (e) {
        console.log('keepAlive', e);
      }
    }
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      console.log('keepAlive onUpdated listener');
      void (async function async() {
        await retryOnTabUpdate(tabId, changeInfo);
      })();
    });
  }

  async function retryOnTabUpdate(_: number, changeInfo: chrome.tabs.TabChangeInfo) {
    if (changeInfo.url && /^(file|https?):/.test(changeInfo.url)) {
      void (await keepAlive());
    }
  }

  return { doing: keepAlive };
}
