import { v4 as uuid } from 'uuid';

import type { BaseRequest, Request, Response } from '@/types/message/inject';

import { cosmosProvider } from './cosmos/provider';

const REQUEST_TYPE = 'cosmostation_request';
const RESPONSE_TYPE = 'cosmostation_response';

export const requestApp = <T extends Request>(message: BaseRequest) =>
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

// NOTE 구버젼의 common ,com_providers가 keplr. ethereum덮어쓰기 위한 용도인 것 같음. 유저가 덮어쓸지말지 선택할 수 있으니까 그거같음.
// NOTE 인젝트 스크립트에서는 크롬스토리지에 접근이 불가능하니 이렇게 구현한 의도라고 추측됨.
window.cosmostation = {
  version: __APP_VERSION__,
  request: requestApp,
  cosmos: cosmosProvider,
};
