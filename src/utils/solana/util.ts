import type { Transaction, VersionedTransaction } from '@solana/web3.js';

export function isVersionedTransaction(transaction: Transaction | VersionedTransaction): transaction is VersionedTransaction {
  return 'version' in transaction;
}
