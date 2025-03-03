import type { BaseRequest } from '@/types/message/inject';

import { requestApp } from '../../request';

export const suiRequestApp = <T extends BaseRequest>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'sui',
  };

  return requestApp(requestParam);
};
