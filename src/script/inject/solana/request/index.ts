import type { BaseRequest } from '@/types/message/inject';

import { requestApp } from '../../request';

export const solanaRequestApp = <T extends BaseRequest>(message: T) => {
  const requestParam = {
    ...message,
    chainType: 'solana',
  };

  return requestApp(requestParam);
};
