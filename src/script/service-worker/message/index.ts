import type { Request } from '@/types/message/inject';

import { commonProcess } from './common';
import { cosmosProcess } from './cosmos';

export async function process(message: Request) {
  try {
    console.log('process', message);

    if (message.chainType === 'cosmos') {
      await cosmosProcess(message);
    }
    if (message.chainType === 'common') {
      await commonProcess(message);
    }
  } catch (e) {
    console.log('process error', e);
  }
}
