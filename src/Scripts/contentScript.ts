import { COSMOS_LISTENER_TYPE, ETHEREUM_LISTENER_TYPE, MESSAGE_TYPE } from '~/constants/message';
import type {
  BackgroundToContentScriptEventMessage,
  ContentScriptToBackgroundEventMessage,
  ContentScriptToWebEventMessage,
  ListenerMessage,
  ListenerType,
  RequestMessage,
  ResponseMessage,
  WebToContentScriptEventMessage,
} from '~/types/message';

/** WebPage -> ContentScript -> Background */

// Once Message
window.addEventListener('message', (event: MessageEvent<WebToContentScriptEventMessage<RequestMessage>>) => {
  if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT) {
    const { data } = event;

    const toBackgroundMessage: ContentScriptToBackgroundEventMessage<RequestMessage> = {
      line: data.line,
      type: MESSAGE_TYPE.REQUEST__CONTENT_SCRIPT_TO_BACKGROUND,
      origin: event.origin,
      messageId: data.messageId,
      message: data.message,
    };
    chrome.runtime.sendMessage(toBackgroundMessage);
  }
});

/** Background -> ContentScript -> WebPage */

// Once Message
chrome.runtime.onMessage.addListener((request: BackgroundToContentScriptEventMessage<ResponseMessage, RequestMessage>, _, sendResponse) => {
  if (request?.type === MESSAGE_TYPE.RESPONSE__CONTENT_SCRIPT_TO_BACKGROUND) {
    sendResponse();

    const toWebMessage: ContentScriptToWebEventMessage<ResponseMessage, RequestMessage> = {
      response: request.response,
      message: request.message,
      messageId: request.messageId,
      isCosmostation: true,
      type: MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT,
    };

    window.postMessage(toWebMessage);
  }
});

// On Message
chrome.runtime.onMessage.addListener((request: ListenerMessage<ResponseMessage>, _, sendResponse) => {
  const types = (() => {
    if (request.line === 'COSMOS') return Object.values(COSMOS_LISTENER_TYPE);
    if (request.line === 'ETHEREUM') return Object.values(ETHEREUM_LISTENER_TYPE);

    return [];
  })() as ListenerType[];

  if (types.includes(request?.type)) {
    sendResponse();

    const toWebMessage: ListenerMessage<ResponseMessage> = {
      line: request.line,
      type: request.type,
      isCosmostation: true,
      message: request.message,
    };

    window.postMessage(toWebMessage);
  }
});

// injectScript
const rootElement = document.head || document.documentElement;
const scriptElement = document.createElement('script');

scriptElement.src = chrome.runtime.getURL('js/injectScript.js');
scriptElement.type = 'text/javascript';
rootElement.appendChild(scriptElement);
scriptElement.remove();
