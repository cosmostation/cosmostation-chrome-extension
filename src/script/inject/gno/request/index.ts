import type { BaseRequest } from '@/types/message/inject';

import { requestApp } from '../../request';

export const gnoRequestApp = <T extends BaseRequest>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'gno',
  };

  return requestApp(requestParam);
};
