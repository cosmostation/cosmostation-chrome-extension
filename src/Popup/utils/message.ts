import { MESSAGE_TYPE } from '~/constants/message';
import type { InMemoryData, InMemoryDataKeys } from '~/types/inMemory';
import type {
  BackgroundToContentScriptEventMessage,
  InMemoryMessageMethodGet,
  InMemoryMessageMethodGetAll,
  InMemoryMessageMethodSet,
  ListenerMessage,
  ResponseMessage,
} from '~/types/message';

export function responseToWeb<T>(data: Omit<BackgroundToContentScriptEventMessage<T>, 'type'>) {
  console.log('popup response');
  const toContentScriptMessage: BackgroundToContentScriptEventMessage<T> = {
    origin: data.origin,
    messageId: data.messageId,
    message: data.message,
    type: MESSAGE_TYPE.RESPONSE__CONTENT_SCRIPT_TO_BACKGROUND,
  };

  if (data.tabId) {
    chrome.tabs.sendMessage(data.tabId, toContentScriptMessage);
  } else {
    chrome.tabs.query({ url: `${data.origin}/*` }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, toContentScriptMessage);
        }
      });
    });
  }
}

export function emitToWeb(data: Omit<ListenerMessage<ResponseMessage>, 'isCosmostation'>) {
  console.log('editToWeb(background)');
  const toContentScriptMessage: ListenerMessage<ResponseMessage> = {
    isCosmostation: true,
    message: data.message,
    type: data.type,
  };

  chrome.tabs.query({ url: '<all_urls>' }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, toContentScriptMessage);
      }
    });
  });
}

// request background
export function requestGetInMemory<T extends InMemoryDataKeys>(key: T): Promise<InMemoryData[T]> {
  const message: InMemoryMessageMethodGet = { method: 'get', params: { key } };

  const requestMessage = {
    type: MESSAGE_TYPE.IN_MEMORY,
    message,
  };

  return new Promise((res, rej) => {
    chrome.runtime.sendMessage(requestMessage, (response: InMemoryData[T]) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res(response);
    });
  });
}

// request background
export function requestSetInMemory<T extends InMemoryDataKeys>(
  key: T,
  value: InMemoryData[T],
): Promise<InMemoryData[T]> {
  const message: InMemoryMessageMethodSet = { method: 'set', params: { key, value } };

  const requestMessage = {
    type: MESSAGE_TYPE.IN_MEMORY,
    message,
  };

  return new Promise((res, rej) => {
    chrome.runtime.sendMessage(requestMessage, (response: InMemoryData[T]) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res(response);
    });
  });
}

// request background
export function requestGetAllInMemory(): Promise<InMemoryData> {
  const message: InMemoryMessageMethodGetAll = { method: 'getAll' };

  const requestMessage = {
    type: MESSAGE_TYPE.IN_MEMORY,
    message,
  };

  return new Promise((res, rej) => {
    chrome.runtime.sendMessage(requestMessage, (response: InMemoryData) => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError);
      }
      res(response);
    });
  });
}
