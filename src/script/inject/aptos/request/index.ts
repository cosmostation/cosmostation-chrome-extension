import type { BaseRequest } from '@/types/message/inject';

import { requestApp } from '../../request';

export const aptosRequestApp = <T extends BaseRequest>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'aptos',
  };

  return requestApp(requestParam);
};
