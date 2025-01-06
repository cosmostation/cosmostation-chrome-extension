import { v4 as uuid } from 'uuid';

import type { Request, Response } from '@/types/message/inject';

const REQUEST_TYPE = 'cosmostation_request';
const RESPONSE_TYPE = 'cosmostation_response';

export const requestApp = <T extends Request>(message: T) =>
  new Promise((res, rej) => {
    const requestId = uuid();

    const event = new CustomEvent(REQUEST_TYPE, {
      detail: { ...message, requestId, origin: window.location.origin },
    });

    const handler = (event: CustomEvent<Response<T>>) => {
      window.removeEventListener(RESPONSE_TYPE, handler, false);

      const { detail } = event;

      if (detail?.error) {
        rej(detail.error);
      } else {
        res(detail.result);
      }
    };

    window.addEventListener(RESPONSE_TYPE, handler);

    window.dispatchEvent(event);
  });

window.cosmostation = {
  request: requestApp,
};
