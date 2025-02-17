import type { SendRawTransaction } from '@/types/bitcoin/txs';

import { isValidBitcoinTx } from './tx';
import { post } from '../axios';

export async function executeTransactionSequentially(txHex: string, urls: string[]) {
  if (!isValidBitcoinTx(txHex)) {
    throw new Error('Invalid transaction');
  }

  for (const url of urls) {
    try {
      const response = await post<SendRawTransaction>(
        url,
        {
          jsonrpc: '2.0',
          id: '1',
          method: 'sendrawtransaction',
          params: [txHex],
        },
        { headers: { 'Content-Type': 'application/json' } },
      );
      return response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (_) {}
  }
  throw new Error('All RPC URLs failed');
}
