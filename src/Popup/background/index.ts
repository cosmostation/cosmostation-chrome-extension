import { IN_MEMORY_MESSAGE_TYPE, MESSAGE_TYPE } from '~/constants/message';
import { THEME_TYPE } from '~/constants/theme';
import { setStorage } from '~/Popup/utils/chromeStorage';
import { openTab } from '~/Popup/utils/chromeTabs';
import type {
  ContentScriptToBackgroundEventMessage,
  InMemoryMessage,
  RequestMessage,
  ResponseMessage,
} from '~/types/message';

import { inMemory } from './inMemory';
import { persistent } from './persistent';

function background() {
  const memory = inMemory();
  console.log('background start');

  chrome.runtime.onMessage.addListener((request: ContentScriptToBackgroundEventMessage<RequestMessage>, sender) => {
    console.log('content-script to background', request, sender);

    if (request?.type === MESSAGE_TYPE.REQUEST__CONTENT_SCRIPT_TO_BACKGROUND) {
      void (async function asyncHandler() {
        chrome.tabs.query({ url: `${request.origin}/*` }, (tabs) => {
          tabs.forEach((tab) => {
            console.log('tabid', tab.id);
            if (tab.id) {
              const toContentScriptMessage: ContentScriptToBackgroundEventMessage<ResponseMessage> = {
                type: MESSAGE_TYPE.RESPONSE__CONTENT_SCRIPT_TO_BACKGROUND,
                messageId: request.messageId,
                message: { data: request.message, error: null },
                origin: request.origin,
              };
              chrome.tabs.sendMessage(tab.id, toContentScriptMessage);
            }
          });
        });

        const url = chrome.runtime.getURL('popup.html');

        const aa = await chrome.windows.create({ width: 320, height: 560, url, type: 'popup' });
      })();
    }
  });

  chrome.runtime.onMessage.addListener((request: InMemoryMessage, sender, sendResponse) => {
    console.log('in memory in background', request, sender);

    if (request?.type === MESSAGE_TYPE.IN_MEMORY) {
      const { message } = request;

      if (message.method === IN_MEMORY_MESSAGE_TYPE.GET) {
        sendResponse(memory.get(message.params.key));
      }

      if (message.method === IN_MEMORY_MESSAGE_TYPE.GET_ALL) {
        sendResponse(memory.getAll());
      }

      if (message.method === IN_MEMORY_MESSAGE_TYPE.SET) {
        memory.set(message.params.key, message.params.value);
        sendResponse(memory.get(message.params.key));
      }
    }
  });

  chrome.runtime.onStartup.addListener(() => {
    console.log('startup');
    void (async function async() {
      await setStorage('queues', []);
      await setStorage('windowId', null);
    })();
  });

  chrome.runtime.onInstalled.addListener((details) => {
    void (async function async() {
      if (details.reason === 'install') {
        await setStorage('queues', []);
        await setStorage('windowId', null);
        await setStorage('accounts', []);
        await setStorage('encryptedPassword', null);
        await setStorage('theme', THEME_TYPE.LIGHT);
        await setStorage('selectedAccountName', '');
        await openTab();
      }
    })();
  });

  const { doing } = persistent();
  void doing();
}

background();
