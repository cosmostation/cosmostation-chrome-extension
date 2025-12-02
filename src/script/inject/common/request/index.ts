import type { BaseRequest } from '@/types/message/inject';

import { requestApp } from '../../request';

export const commonRequestApp = <T extends BaseRequest>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'common',
  };

  return requestApp(requestParam);
};
