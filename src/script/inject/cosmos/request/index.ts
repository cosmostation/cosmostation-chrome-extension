import type { BaseRequest } from '@/types/message/inject';

import { requestApp } from '../../request';

export const cosmosRequestApp = <T extends BaseRequest>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'cosmos',
  };

  return requestApp(requestParam);
};
