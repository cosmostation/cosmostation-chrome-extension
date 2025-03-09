import type { BaseRequest } from '@/types/message/inject';

import { requestApp } from '../../request';

export const evmRequestApp = <T extends BaseRequest>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'evm',
  };

  return requestApp(requestParam);
};
