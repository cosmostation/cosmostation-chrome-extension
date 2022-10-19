import { v4 as uuidv4 } from 'uuid';

import { LINE_TYPE } from '~/constants/chain';
import { MESSAGE_TYPE } from '~/constants/message';
import type { CommonRequestMessage, ContentScriptToWebEventMessage, EthereumRequestMessage, ResponseMessage } from '~/types/message';

const request = (message: CommonRequestMessage) =>
  new Promise((res, rej) => {
    const messageId = uuidv4();

    const handler = (event: MessageEvent<ContentScriptToWebEventMessage<ResponseMessage, EthereumRequestMessage>>) => {
      if (event.data?.isCosmostation && event.data?.type === MESSAGE_TYPE.RESPONSE__WEB_TO_CONTENT_SCRIPT && event.data?.messageId === messageId) {
        window.removeEventListener('message', handler);

        const { data } = event;

        if (data.response?.error) {
          rej(data.response.error);
        } else {
          res(data.response.result);
        }
      }
    };

    window.addEventListener('message', handler);

    window.postMessage({
      isCosmostation: true,
      line: LINE_TYPE.COMMON,
      type: MESSAGE_TYPE.REQUEST__WEB_TO_CONTENT_SCRIPT,
      messageId,
      message,
    });
  });

export const common: Common = {
  request,
};
