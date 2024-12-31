// import { addAccount } from '@/libs/account';
// import { getAccountAssets } from '@/libs/asset';

// import { addressToStorage, balanceToStorage, chainsAndAssetstoStorage } from './storage';
import type { Message } from '@/types/message';

import { address } from './update/address';
import { updateActiveAssetsBalance, updateDefaultAssetsBalance } from './update/balance';
import { v11 } from './update/v11';

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// const response = await chrome.runtime.sendMessage({ })

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  (async () => {
    console.log('message', message);
    console.log('sender', sender);

    if (sender?.id === chrome.runtime.id && message?.target === 'SERVICE_WORKER') {
      if (message.method === 'updateBalance') {
        const [id] = message.params;
        await updateActiveAssetsBalance(id);
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
        sendResponse(null);
      }
    }
  })();
  return true;
});

chrome.runtime.onInstalled.addListener(async () => {
  await v11();
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
