import { Transaction, VersionedTransaction } from '@solana/web3.js';

export type ParsedInstruction = {
  index: number;
  programId: string;
  accounts: string[];
  data: string;
};

export function parseInstructionsFromTx(tx: Transaction | VersionedTransaction): ParsedInstruction[] {
  if ('version' in tx) {
    // VersionedTransaction
    const msg = tx.message;
    return msg.compiledInstructions.map((ix, index) => ({
      index,
      programId: msg.staticAccountKeys[ix.programIdIndex]?.toBase58() ?? 'unknown',
      accounts: ix.accountKeyIndexes.map((i) => msg.staticAccountKeys[i]?.toBase58() ?? 'unknown'),
      data: Buffer.from(ix.data).toString('hex'),
    }));
  } else {
    // Legacy Transaction
    const msg = tx;
    return msg.instructions.map((ix, index) => ({
      index,
      programId: ix.programId.toBase58(),
      accounts: ix.keys.map((k) => k.pubkey.toBase58()),
      data: ix.data.toString('hex'),
    }));
  }
}

export function deserializeTransaction(tx: string): Transaction | VersionedTransaction {
  const serializedTx = Buffer.from(tx, 'hex');

  const transaction = VersionedTransaction.deserialize(serializedTx);

  if (transaction.version === 'legacy') {
    return Transaction.from(serializedTx);
  }

  return transaction;
}
