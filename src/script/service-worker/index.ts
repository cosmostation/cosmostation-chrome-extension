import { throttle } from 'es-toolkit';

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
import {
  updateActiveAssetsBalance,
  updateCustomBalance,
  updateDefaultAssetsBalance,
  updatePriorityBalance,
  updateSpecificChainBalance,
} from './update/balance';
import { updatePriorityChainStaking, updateSpecificChainStaking, updateStakingRelatedBalance } from './update/staking';
import { v11 } from './update/v11';

initExtensionView();

startAutoLockTimer();

const inProgressMap: Record<string, Set<string>> = {};
const inProgressTimestamps: Record<string, Record<string, number>> = {};

const CLEANUP_INTERVAL = 5 * 60 * 1000;
const MAX_PROGRESS_TIME = 10 * 60 * 1000;

function isInProgress(method: string, id: string): boolean {
  return inProgressMap[method]?.has(id) ?? false;
}

function setInProgress(method: string, id: string) {
  if (!inProgressMap[method]) {
    inProgressMap[method] = new Set();
    inProgressTimestamps[method] = {};
  }

  inProgressMap[method].add(id);
  inProgressTimestamps[method][id] = Date.now();
}

function clearInProgress(method: string, id: string): void {
  inProgressMap[method]?.delete(id);
  if (inProgressTimestamps[method]) {
    delete inProgressTimestamps[method][id];
  }
}

function cleanupStaleProgress(): void {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [method, timestamps] of Object.entries(inProgressTimestamps)) {
    for (const [id, timestamp] of Object.entries(timestamps)) {
      if (now - timestamp > MAX_PROGRESS_TIME) {
        inProgressMap[method]?.delete(id);
        delete inProgressTimestamps[method][id];
        cleanedCount++;
        devLogger.warn(`Cleaned up stale progress entry: ${method}:${id}`);
      }
    }
  }

  if (cleanedCount > 0) {
    devLogger.log(`Cleaned up ${cleanedCount} stale progress entries`);
  }
}

function forceCleanupAllProgress(): void {
  devLogger.log('Force cleaning up all progress entries');
  Object.keys(inProgressMap).forEach((key) => delete inProgressMap[key]);
  Object.keys(inProgressTimestamps).forEach((key) => delete inProgressTimestamps[key]);
}

forceCleanupAllProgress();

setInterval(cleanupStaleProgress, CLEANUP_INTERVAL);

function sendUpdateAssetsMessage() {
  if (__APP_BROWSER__ === 'chrome') {
    chrome.runtime.sendMessage({ type: 'updateAssets' });
  } else {
    browser.runtime.sendMessage({ type: 'updateAssets' });
  }
}

const throttledSendUpdateAssetsMessage = throttle(sendUpdateAssetsMessage, 500, { edges: ['trailing'] });

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
      const { method, params } = message;

      if (method === 'updateBalance') {
        const [id] = params;

        if (isInProgress(method, id)) {
          devLogger.log(`[${method}] Skipped (already in progress) for id=${id}`);
          sendResponse(null);
          return;
        }

        if (await isRequestThrottled(method, id)) {
          devLogger.log(`[${method}] Throttled for id=${id}`);
          sendResponse(null);
          return;
        }

        setInProgress(method, id);

        try {
          await updateActiveAssetsBalance(id);
          await updateCustomBalance(id);
          await recordRequestTimestamp(method, id);
        } catch (e) {
          devLogger.error(`${method} error`, e);
        } finally {
          clearInProgress(method, id);
        }

        sendResponse(null);
      }

      if (method === 'updateStaking') {
        const [id] = params;

        if (isInProgress(method, id)) {
          devLogger.log(`[${method}] Skipped (already in progress) for id=${id}`);
          sendResponse(null);
          return;
        }

        if (await isRequestThrottled(method, id)) {
          devLogger.log(`[${method}] Throttled for id=${id}`);
          sendResponse(null);
          return;
        }

        setInProgress(method, id);

        try {
          await updateStakingRelatedBalance(id);
          await recordRequestTimestamp(method, id);
        } catch (e) {
          devLogger.error(`${method} error`, e);
        } finally {
          clearInProgress(method, id);
        }

        sendResponse(null);
      }

      if (method === 'updateAccountInfo') {
        const [id] = params;

        if (isInProgress(method, id)) {
          devLogger.log(`[${method}] Skipped (already in progress) for id=${id}`);
          sendResponse(null);
          return;
        }

        if (await isRequestThrottled(method, id)) {
          devLogger.log(`[${method}] Throttled for id=${id}`);
          sendResponse(null);
          return;
        }
        setInProgress(method, id);

        try {
          await updateAccountInfo(id);
          await recordRequestTimestamp(method, id);
        } catch (e) {
          devLogger.error(`${method} error`, e);
        } finally {
          clearInProgress(method, id);
        }

        sendResponse(null);
      }

      if (method === 'updateDefaultBalance') {
        const [id] = params;

        if (isInProgress(method, id)) {
          devLogger.log(`[${method}] Skipped (already in progress) for id=${id}`);
          sendResponse(null);
          return;
        }

        setInProgress(method, id);

        try {
          await updateDefaultAssetsBalance(id);
        } catch (e) {
          devLogger.error(`${method} error`, e);
        } finally {
          clearInProgress(method, id);
        }

        sendResponse(null);
      }

      if (method === 'updateAddress') {
        const [id] = params;

        if (isInProgress(method, id)) {
          devLogger.log(`[${method}] Skipped (already in progress) for id=${id}`);
          sendResponse(null);
          return;
        }

        setInProgress(method, id);

        try {
          await address(id);
          await customChainAddress(id);
        } catch (e) {
          devLogger.error(`${method} error`, e);
        } finally {
          clearInProgress(method, id);
        }

        sendResponse(null);
      }

      if (method === 'updateChainSpecificBalance') {
        const [id, chainId] = params;

        const key = `${id}:${chainId}`;
        if (isInProgress(method, key)) {
          devLogger.log(`[${method}] Skipped (already in progress) for id=${key}`);
          sendResponse(null);
          return;
        }

        setInProgress(method, key);

        try {
          await updateSpecificChainBalance(id, chainId);
        } catch (e) {
          devLogger.error(`${method} error`, e);
        } finally {
          clearInProgress(method, key);
        }

        sendResponse(null);
      }

      if (method === 'updateChainSpecificStakingBalance') {
        const [id, chainId] = params;

        const key = `${id}:${chainId}`;

        if (isInProgress(method, key)) {
          devLogger.log(`[${method}] Skipped (already in progress) for id=${key}`);
          sendResponse(null);
          return;
        }

        setInProgress(method, key);
        try {
          await updateSpecificChainBalance(id, chainId);
          await updateSpecificChainStaking(id, chainId);
        } catch (e) {
          devLogger.error(`${method} error`, e);
        } finally {
          clearInProgress(method, key);
        }

        sendResponse(null);
      }

      if (method === 'updateHighPriorityBalance') {
        const [id] = params;

        if (isInProgress(method, id)) {
          devLogger.log(`[${method}] Skipped (already in progress) for id=${id}`);
          sendResponse(null);
          return;
        }

        if (await isRequestThrottled(method, id)) {
          devLogger.log(`[${method}] Throttled for id=${id}`);
          sendResponse(null);
          return;
        }

        setInProgress(method, id);

        try {
          await updatePriorityBalance(id, 'high', throttledSendUpdateAssetsMessage);
          await recordRequestTimestamp(method, id);
        } catch (e) {
          devLogger.error(`${method} error`, e);
        } finally {
          clearInProgress(method, id);
        }

        sendResponse(null);
      }

      if (method === 'updateLowPriorityBalance') {
        const [id] = params;

        if (isInProgress(method, id)) {
          devLogger.log(`[${method}] Skipped (already in progress) for id=${id}`);
          sendResponse(null);
          return;
        }

        if (await isRequestThrottled(method, id)) {
          devLogger.log(`[${method}] Throttled for id=${id}`);
          sendResponse(null);
          return;
        }

        setInProgress(method, id);

        try {
          await updatePriorityBalance(id, 'low', throttledSendUpdateAssetsMessage);

          await recordRequestTimestamp(method, id);
        } catch (e) {
          devLogger.error(`${method} error`, e);
        } finally {
          clearInProgress(method, id);
        }

        sendResponse(null);
      }

      if (method === 'updateHighPriorityStaking') {
        const [id] = params;

        if (isInProgress(method, id)) {
          devLogger.log(`[${method}] Skipped (already in progress) for id=${id}`);
          sendResponse(null);
          return;
        }

        if (await isRequestThrottled(method, id)) {
          devLogger.log(`[${method}] Throttled for id=${id}`);
          sendResponse(null);
          return;
        }

        setInProgress(method, id);

        try {
          await updatePriorityChainStaking(id, 'high', throttledSendUpdateAssetsMessage);
          await recordRequestTimestamp(method, id);
        } catch (e) {
          devLogger.error(`${method} error`, e);
        } finally {
          clearInProgress(method, id);
        }

        sendResponse(null);
      }

      if (method === 'updateLowPriorityStaking') {
        const [id] = params;

        if (isInProgress(method, id)) {
          devLogger.log(`[${method}] Skipped (already in progress) for id=${id}`);
          sendResponse(null);
          return;
        }

        if (await isRequestThrottled(method, id)) {
          devLogger.log(`[${method}] Throttled for id=${id}`);
          sendResponse(null);
          return;
        }

        setInProgress(method, id);

        try {
          await updatePriorityChainStaking(id, 'low', throttledSendUpdateAssetsMessage);
          await recordRequestTimestamp(method, id);
        } catch (e) {
          devLogger.error(`${method} error`, e);
        } finally {
          clearInProgress(method, id);
        }

        sendResponse(null);
      }

      if (method === 'requestApp') {
        await process({ ...params, tabId: sender.tab?.id });
        sendResponse(null);
      }

      if (method === 'openSidePanel') {
        if (sender.tab?.id && typeof chrome !== 'undefined' && typeof chrome.sidePanel !== 'undefined') {
          if (__APP_BROWSER__ === 'chrome') {
            if (!chrome.sidePanel) return;

            await chrome.sidePanel.open({ tabId: sender.tab.id });
            await chrome.sidePanel.setOptions({
              tabId: sender.tab.id,
              path: 'sidepanel.html',
              enabled: true,
            });
          } else {
            browser.sidebarAction.setPanel({ panel: 'sidepanel.html' });
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
