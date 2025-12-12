import { v4 as uuid } from 'uuid';

import type { BaseRequest, Request, Response } from '@/types/message/inject';

const REQUEST_TYPE = 'cosmostation_request';
const RESPONSE_TYPE = 'cosmostation_response';

export const requestApp = <T extends Request>(message: BaseRequest) =>
  new Promise((res, rej) => {
    const requestId = uuid();

    const event = new CustomEvent(REQUEST_TYPE, {
      detail: { ...message, requestId, origin: window.location.origin },
    });

    const handler = (event: CustomEvent<Response<T>>) => {
      try {
        const { id, error, result } = event.detail || {};

        if (id === requestId) {
          window.removeEventListener(RESPONSE_TYPE, handler, false);

          if (error) {
            rej(error);
          } else {
            res(result);
          }
        }
      } catch (err) {
        console.error('Event handler error:', err);
      }
    };

    window.addEventListener(RESPONSE_TYPE, handler);

    window.dispatchEvent(event);
  });
