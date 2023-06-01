import { MESSAGE_TYPE } from '~/constants/message';
import { extension } from '~/Popup/utils/extension';
import type { BackgroundToContentScriptEventMessage, ListenerMessage, ResponseMessage } from '~/types/message';

export function responseToWeb<T, U>(data: Omit<BackgroundToContentScriptEventMessage<T, U>, 'type'>) {
  const toContentScriptMessage: BackgroundToContentScriptEventMessage<T, U> = {
    origin: data.origin,
    messageId: data.messageId,
    message: data.message,
    response: data.response,
    type: MESSAGE_TYPE.RESPONSE__CONTENT_SCRIPT_TO_BACKGROUND,
  };

  if (data.tabId) {
    void extension.tabs.sendMessage(data.tabId, toContentScriptMessage);
  } else {
    if (!data.origin) return;

    void extension.tabs.query({ url: `${data.origin}/*` }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          void extension.tabs.sendMessage(tab.id, toContentScriptMessage);
        }
      });
    });
  }
}

export function emitToWeb(data: Omit<ListenerMessage<ResponseMessage>, 'isCosmostation'>, origins: string[]) {
  const toContentScriptMessage: ListenerMessage<ResponseMessage> = {
    isCosmostation: true,
    line: data.line,
    message: data.message,
    type: data.type,
  };

  origins.forEach((origin) => {
    void extension.tabs.query({ url: `${origin}/*` }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          void extension.tabs.sendMessage(tab.id, toContentScriptMessage);
        }
      });
    });
  });
}
