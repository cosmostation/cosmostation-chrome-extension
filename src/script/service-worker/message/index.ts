import type { Request } from '@/types/message/inject';

import { aptosProcess } from './apots';
import { bitcoinProcess } from './bitcoin';
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
    if (message.chainType === 'bitcoin') {
      await bitcoinProcess(message);
    }
    if (message.chainType === 'aptos') {
      await aptosProcess(message);
    }
  } catch (e) {
    console.log('process error', e);
  }
}
