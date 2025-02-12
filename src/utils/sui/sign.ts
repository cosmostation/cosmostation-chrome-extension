import { SuiClient } from '@mysten/sui/client';
import type { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { type Transaction as TransactionType } from '@mysten/sui/transactions';

export async function signAndExecuteTxSequentially(signer: Ed25519Keypair, transaction: TransactionType, urls: string[]) {
  for (const url of urls) {
    const client = new SuiClient({ url });
    try {
      const response = await client.signAndExecuteTransaction({
        signer: signer,
        transaction: transaction,
      });

      return response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (_) {}
  }
  throw new Error('All RPC URLs failed');
}
