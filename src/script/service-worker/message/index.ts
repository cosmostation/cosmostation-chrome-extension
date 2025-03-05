import type { Request } from '@/types/message/inject';

import { commonProcess } from './common';
import { cosmosProcess } from './cosmos';
import { evmProcess } from './evm';
import { suiProcess } from './sui';

export async function process(message: Request) {
  try {
    console.log('process', message);

    if (message.chainType === 'cosmos') {
      await cosmosProcess(message);
    }
    if (message.chainType === 'common') {
      await commonProcess(message);
    }
    if (message.chainType === 'evm') {
      await evmProcess(message);
    }
    if (message.chainType === 'sui') {
      await suiProcess(message);
    }
  } catch (e) {
    console.log('process error', e);
  }
}
