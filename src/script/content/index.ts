import {
  APTOS_LISTENER_TYPE,
  BITCOIN_LISTENER_TYPE,
  COSMOS_LISTENER_TYPE,
  ETHEREUM_LISTENER_TYPE,
  GNO_LISTENER_TYPE,
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
});

const CHAIN_TYPE_TO_LISTENER_TYPES: Record<ChainType, ListenerType[]> = {
  cosmos: Object.values(COSMOS_LISTENER_TYPE),
  evm: Object.values(ETHEREUM_LISTENER_TYPE),
  aptos: Object.values(APTOS_LISTENER_TYPE),
  sui: Object.values(SUI_LISTENER_TYPE),
  bitcoin: Object.values(BITCOIN_LISTENER_TYPE),
  iota: Object.values(IOTA_LISTENER_TYPE),
  solana: Object.values(SOLANA_LISTENER_TYPE),
  gno: Object.values(GNO_LISTENER_TYPE),
};

const getListenerTypes = (chainType: ChainType): ListenerType[] => {
  return CHAIN_TYPE_TO_LISTENER_TYPES[chainType] ?? [];
};

chrome.runtime.onMessage.addListener(
  (
    data: {
      event: ListenerType;
      chainType: ChainType;
      data: unknown;
    },
    sender,
  ) => {
    if (sender.id !== chrome.runtime.id) return false;

    const validListenerTypes = getListenerTypes(data.chainType);

    if (!validListenerTypes.includes(data.event)) return false;

    const customEvent = new CustomEvent(data.event, {
      detail: {
        chainType: data.chainType,
        data: data.data,
      },
    });

    window.dispatchEvent(customEvent);

    return false;
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
