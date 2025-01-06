import { sendMessage } from '@/libs/extension';
import type { ContentMessage } from '@/types/message/content';

window.addEventListener('cosmostation_request', (event) => {
  (async () => {
    const message = { target: 'SERVICE_WORKER', method: 'requestApp', params: event.detail } as const;

    await sendMessage(message);
  })();
});

chrome.runtime.onMessage.addListener((message: ContentMessage, sender, sendResponse) => {
  (async () => {
    console.log('content message', message);
    console.log('content sender', sender);

    if (sender?.id === chrome.runtime.id && message?.target === 'CONTENT') {
      if (message.method === 'responseApp') {
        const event = new CustomEvent('cosmostation_response', {
          detail: message.params,
        });

        window.dispatchEvent(event);
        sendResponse(null);
      }
    }
  })();
  return true;
});

const rootElement = document.head || document.documentElement;
const scriptElement = document.createElement('script');

scriptElement.src = chrome.runtime.getURL('js/inject.js');
scriptElement.type = 'text/javascript';
rootElement.appendChild(scriptElement);
scriptElement.remove();
