import {
  APTOS_LISTENER_TYPE,
  BITCOIN_LISTENER_TYPE,
  COSMOS_LISTENER_TYPE,
  ETHEREUM_LISTENER_TYPE,
  IOTA_LISTENER_TYPE,
  SOLANA_LISTENER_TYPE,
  SUI_LISTENER_TYPE,
} from '@/constants/message';
import { sendMessage } from '@/libs/extension';
import type { ChainType } from '@/types/chain';
import type { ListenerType } from '@/types/message';
import type { ContentMessage } from '@/types/message/content';
import { devLogger } from '@/utils/devLogger';

window.addEventListener('cosmostation_request', (event) => {
  (async () => {
    const message = { target: 'SERVICE_WORKER', method: 'requestApp', params: event.detail } as const;

    await sendMessage(message);
  })();
});

chrome.runtime.onMessage.addListener((message: ContentMessage, sender, sendResponse) => {
  (async () => {
    devLogger.log('content message', message);
    devLogger.log('content sender', sender);

    if (sender?.id === chrome.runtime.id && message?.target === 'CONTENT') {
      if (message.method === 'responseApp') {
        const event = new CustomEvent('cosmostation_response', {
          detail: message.params,
        });

        window.dispatchEvent(event);
        sendResponse(null);
      }

      if (message.method === 'openSidePanel') {
        sendMessage({
          target: 'SERVICE_WORKER',
          method: 'openSidePanel',
          params: undefined,
          origin: message.origin,
          requestId: message.requestId,
          tabId: message.tabId,
        });
        sendResponse(null);
      }
    }
  })();
  return true;
});

chrome.runtime.onMessage.addListener(
  (
    data: {
      event: ListenerType;
      chainType: ChainType;
      data: unknown;
    },
    sender,
  ) => {
    if (sender.id !== chrome.runtime.id) return;

    const types = (() => {
      if (data.chainType === 'cosmos') return Object.values(COSMOS_LISTENER_TYPE);
      if (data.chainType === 'evm') return Object.values(ETHEREUM_LISTENER_TYPE);
      if (data.chainType === 'aptos') return Object.values(APTOS_LISTENER_TYPE);
      if (data.chainType === 'sui') return Object.values(SUI_LISTENER_TYPE);
      if (data.chainType === 'bitcoin') return Object.values(BITCOIN_LISTENER_TYPE);
      if (data.chainType === 'iota') return Object.values(IOTA_LISTENER_TYPE);
      if (data.chainType === 'solana') return Object.values(SOLANA_LISTENER_TYPE);

      return [];
    })() as ListenerType[];

    if (types.includes(data.event)) {
      const customEvent = new CustomEvent(data.event, {
        detail: {
          chainType: data.chainType,
          data: data.data,
        },
      });
      window.dispatchEvent(customEvent);
    }
  },
);

function doctypeCheck() {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === 'html';
  }
  return true;
}

function suffixCheck() {
  const prohibitedTypes = [/\.xml$/, /\.pdf$/, /\.asp$/, /\.jsp$/, /\.php$/, /\.md$/, /\.svg$/, /\.docx$/, /\.odt$/, /\.eml$/];
  const currentUrl = window.location.pathname;
  for (const type of prohibitedTypes) {
    if (type.test(currentUrl)) {
      return false;
    }
  }
  return true;
}

function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}

function shouldInjectProvider() {
  return doctypeCheck() && suffixCheck() && documentElementCheck();
}

function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('src', chrome.runtime.getURL('js/inject.js'));
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error(e);
  }
}

if (shouldInjectProvider()) {
  injectScript();
}
