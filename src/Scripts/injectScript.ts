import { v4 as uuidv4 } from 'uuid';

import { LISTENER_TYPE, MESSAGE_TYPE } from '~/constants/message';
import type {
  ListenerMessage,
  ListenerType,
  RequestMessage,
  ResponseMessage,
  WebtoContentScriptEventMessage,
} from '~/types/message';

(function injectScript() {
  console.log('injectScript');
  window.cosmostation = {
    on: (eventName: ListenerType, eventHandler: (data: ResponseMessage) => void) => {
      const handler = (event: MessageEvent<ListenerMessage<ResponseMessage>>) => {
        if (event.data?.isCosmostation && event.data?.type === eventName) {
          eventHandler(event.data.message);
        }
      };

      window.addEventListener('message', handler);
    },
    request: (message: RequestMessage) =>
      new Promise((res, rej) => {
        const messageId = uuidv4();

        const handler = (event: MessageEvent<WebtoContentScriptEventMessage<ResponseMessage>>) => {
          console.log('inject listener', event);

          if (
            event.data?.isCosmostation &&
            event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT &&
            event.data?.messageId === messageId
          ) {
            console.log('inject listener2');
            window.removeEventListener('message', handler);

            const { data } = event;

            if (data.message?.error) {
              rej(data.message);
            } else {
              res(data.message);
            }
            console.log(`response-${messageId}-inject-script`, event);
          }
        };

        window.addEventListener('message', handler);

        window.postMessage({
          isCosmostation: true,
          type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
          messageId,
          message,
        });
      }),
  };
})();
