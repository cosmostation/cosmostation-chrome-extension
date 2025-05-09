import type { BaseRequest } from '@/types/message/inject';

import { requestApp } from '../../request';

export const iotaRequestApp = <T extends BaseRequest>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'iota',
  };

  return requestApp(requestParam);
};
