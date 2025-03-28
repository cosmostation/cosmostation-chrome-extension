// import { addAccount } from '@/libs/account';
// import { getAccountAssets } from '@/libs/asset';

// import { addressToStorage, balanceToStorage, chainsAndAssetstoStorage } from './storage';
import type { RequestQueue } from '@/types/extension';
import type { ServiceWorkerMessage } from '@/types/message/service-worker';
import { extension } from '@/utils/browser';

import { initExtensionView } from './initialize';
import { process } from './message';
import { startAutoLockTimer } from './passwordManage';
import { address, customChainAddress } from './update/address';
import { updateActiveAssetsBalance, updateCustomBalance, updateDefaultAssetsBalance } from './update/balance';
import { v11 } from './update/v11';

initExtensionView();

startAutoLockTimer();
// const response = await chrome.runtime.sendMessage({ })

extension.storage.onChanged.addListener((changes) => {
  for (const [key, { newValue }] of Object.entries(changes)) {
    if (key === 'requestQueue') {
      const newQueues = newValue as RequestQueue[] | undefined;
      const text = newQueues ? `${newQueues.length > 0 ? newQueues.length : ''}` : '';
      void extension.action.setBadgeText({ text });
    }
  }
});

chrome.runtime.onMessage.addListener((message: ServiceWorkerMessage, sender, sendResponse) => {
  (async () => {
    console.log('service worker message', message);
    console.log('service worker sender', sender);

    if (sender?.id === chrome.runtime.id && message?.target === 'SERVICE_WORKER') {
      if (message.method === 'updateBalance') {
        const [id] = message.params;
        await updateActiveAssetsBalance(id);
        await updateCustomBalance(id);

        sendResponse(null);
      }

      if (message.method === 'updateDefaultBalance') {
        const [id] = message.params;
        await updateDefaultAssetsBalance(id);
        sendResponse(null);
      }

      if (message.method === 'updateAddress') {
        const [id] = message.params;
        await address(id);
        await customChainAddress(id);
        sendResponse(null);
      }

      if (message.method === 'requestApp') {
        const { params } = message;

        await process({ ...params, tabId: sender.tab?.id });
        sendResponse(null);
      }

      if (message.method === 'openSidePanel') {
        if (sender.tab?.id && typeof chrome !== 'undefined' && typeof chrome.sidePanel !== 'undefined') {
          if (__APP_BROWSER__ === 'chrome') {
            if (!chrome.sidePanel) {
              return;
            }

            await chrome.sidePanel.open({ tabId: sender.tab.id });
            await chrome.sidePanel.setOptions({
              tabId: sender.tab.id,
              path: 'sidepanel.html',
              enabled: true,
            });
          } else {
            browser.sidebarAction.setPanel({
              panel: 'sidepanel.html',
            });

            browser.sidebarAction.open();
          }
        }

        sendResponse(null);
      }
    }
  })();
  return true;
});

chrome.runtime.onInstalled.addListener(async () => {
  // const isMigrationRequired = await isMigrationRequired_V1_0_0();

  // console.log('🚀 ~ chrome.runtime.onInstalled.addListener ~ isMigrationRequired:', isMigrationRequired);

  // if (isMigrationRequired) {
  //   await migrateData();
  // } else {
  //   await v11();
  // }
  await v11();

  void extension.action.setBadgeBackgroundColor({ color: '#7C4FFC' });
  void extension.action.setBadgeText({ text: '' });
});

// chrome.alarms.create('my5MinuteAlarm', { periodInMinutes: 1 });

// Set up a listener for the alarm event
// chrome.alarms.onAlarm.addListener(async (alarm) => {
//   if (alarm.name === 'my5MinuteAlarm') {
//     await addAccount({
//       id: '656fcd0b-90de-4fde-afdc-2ad6033c5224',
//       index: '0',
//       type: 'MNEMONIC',
//       mnemonic:
//         'now actor question craft ship link monster foot finger brain salmon sudden catch reunion remind wedding equal home scorpion cupboard awesome recycle gain reflect',
//     });

//     await balance('656fcd0b-90de-4fde-afdc-2ad6033c5224');

//     const accountAssets = await getAccountAssets('656fcd0b-90de-4fde-afdc-2ad6033c5224');

//     chrome.storage.local.set({ accountAssets });
//   }
// });

// import { initExtensionView } from './initialize';

// function main() {
//   initExtensionView();
// }

// main();

// function startServiceWorker() {
//   init();
//   handleStorageUpdate();
// }

// startServiceWorker();

// import { initExtensionView } from './initialize';

// function main() {
//   initExtensionView();
// }

// main();
