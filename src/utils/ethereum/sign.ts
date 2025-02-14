import type { TransactionRequest } from 'ethers';
import { ethers } from 'ethers';

import { ethersProvider } from './ethers';

export async function signAndExecuteTxSequentially(privateKey: string, transaction: TransactionRequest, urls: string[]) {
  for (const url of urls) {
    try {
      const provider = ethersProvider(url);

      const signer = new ethers.Wallet(privateKey, provider);

      const response = await signer.sendTransaction(transaction);

      return response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (_) {}
  }
  throw new Error('All RPC URLs failed');
}
