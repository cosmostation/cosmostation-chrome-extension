import type { BaseRequest } from '@/types/message/inject';

import { requestApp } from '../../request';

export const bitcoinRequestApp = <T extends BaseRequest>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'bitcoin',
  };

  return requestApp(requestParam);
};
