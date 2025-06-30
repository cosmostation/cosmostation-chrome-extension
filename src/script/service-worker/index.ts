import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { sendMessage } from '@/libs/extension';
import type { RequestQueue } from '@/types/extension';
import type { ServiceWorkerMessage } from '@/types/message/service-worker';
import { extension } from '@/utils/browser';
import { devLogger } from '@/utils/devLogger';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';
import { isRequestThrottled, recordRequestTimestamp } from '@/utils/updateRequest';
import { openTab } from '@/utils/view/controlView';
import { closeWindow } from '@/utils/view/window';

import { initExtensionView } from './initialize';
import { process } from './message';
import { startAutoLockTimer } from './passwordManage';
import { updateAccountInfo } from './update/account';
import { address, customChainAddress } from './update/address';
import { updateActiveAssetsBalance, updateCustomBalance, updateDefaultAssetsBalance, updateSpecificChainBalance } from './update/balance';
import { updateSpecificChainStaking, updateStakingRelatedBalance } from './update/staking';
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
    devLogger.log('service worker message', message);
    devLogger.log('service worker sender', sender);

    if (sender?.id === chrome.runtime.id && message?.target === 'SERVICE_WORKER') {
      if (message.method === 'updateBalance') {
        const [id] = message.params;

        if (await isRequestThrottled('updateBalance', id)) {
          devLogger.log(`[updateBalance] Throttled for id=${id}`);
          sendResponse(null);
          return;
        }

        try {
          await updateActiveAssetsBalance(id);
          await updateCustomBalance(id);
          await recordRequestTimestamp('updateBalance', id);
        } catch (e) {
          devLogger.error('updateBalance error', e);
        }

        sendResponse(null);
      }

      if (message.method === 'updateDefaultBalance') {
        const [id] = message.params;
        await updateDefaultAssetsBalance(id);
        sendResponse(null);
      }

      if (message.method === 'updateStaking') {
        const [id] = message.params;

        if (await isRequestThrottled('updateStaking', id)) {
          devLogger.log(`[updateStaking] Throttled for id=${id}`);
          sendResponse(null);
          return;
        }

        try {
          await updateStakingRelatedBalance(id);
          await recordRequestTimestamp('updateStaking', id);
        } catch (e) {
          devLogger.error('updateStaking error', e);
        }

        sendResponse(null);
      }

      if (message.method === 'updateAccountInfo') {
        const [id] = message.params;

        if (await isRequestThrottled('updateAccountInfo', id)) {
          devLogger.log(`[updateAccountInfo] Throttled for id=${id}`);
          sendResponse(null);
          return;
        }

        try {
          await updateAccountInfo(id);
          await recordRequestTimestamp('updateAccountInfo', id);
        } catch (e) {
          devLogger.error('updateAccountInfo error', e);
        }

        sendResponse(null);
      }

      if (message.method === 'updateAddress') {
        const [id] = message.params;
        await address(id);
        await customChainAddress(id);
        sendResponse(null);
      }

      if (message.method === 'updateChainSpecificBalance') {
        const [id, chainId, address] = message.params;
        await updateSpecificChainBalance(id, chainId, address);
        sendResponse(null);
      }

      if (message.method === 'updateChainSpecificStakingBalance') {
        const [id, chainId, address] = message.params;
        await updateSpecificChainBalance(id, chainId, address);
        await updateSpecificChainStaking(id, chainId, address);
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

chrome.runtime.onInstalled.addListener((details) => {
  void (async () => {
    await v11();

    if (details.reason === 'install') {
      await openTab();
    }
  })();
});

void extension.action.setBadgeBackgroundColor({ color: '#7C4FFC' });
void extension.action.setBadgeText({ text: '' });

extension.windows.onRemoved.addListener((windowId) => {
  void (async () => {
    const queues = await getExtensionLocalStorage('requestQueue');

    const currentWindowIds = queues.filter((item) => typeof item.windowId === 'number').map((item) => item.windowId) as number[];

    const currentWindowId = await getExtensionLocalStorage('currentWindowId');

    if (typeof currentWindowId === 'number') {
      currentWindowIds.push(currentWindowId);
    }

    const windowIds = Array.from(new Set(currentWindowIds));

    await setExtensionLocalStorage('currentWindowId', null);

    if (windowIds.includes(windowId)) {
      queues.forEach((queue) => {
        sendMessage({
          target: 'CONTENT',
          method: 'responseApp',
          origin: queue.origin,
          requestId: queue.requestId,
          tabId: queue.tabId,
          params: {
            id: queue.requestId,
            error: {
              code: RPC_ERROR.INVALID_INPUT,
              message: `${RPC_ERROR_MESSAGE[RPC_ERROR.INVALID_INPUT]}`,
            },
          },
        });

        void closeWindow(queue.windowId);
      });

      await setExtensionLocalStorage('requestQueue', []);
    }
  })();
});
