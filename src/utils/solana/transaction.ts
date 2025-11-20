import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import type { SetComputeUnitLimitParams, SetComputeUnitPriceParams } from '@solana/web3.js';
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';

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

export function serializeTransaction(tx: Transaction | VersionedTransaction): string {
  if ('version' in tx) {
    return Buffer.from(tx.serialize()).toString('hex');
  } else {
    return Buffer.from(tx.serialize({ requireAllSignatures: false, verifySignatures: false })).toString('hex');
  }
}

export function deserializeTransaction(tx: string | Uint8Array): Transaction | VersionedTransaction {
  const serializedTx = typeof tx === 'string' ? Buffer.from(tx, 'hex') : Buffer.from(tx);

  const transaction = VersionedTransaction.deserialize(serializedTx);

  if (transaction.version === 'legacy') {
    return Transaction.from(serializedTx);
  }

  return transaction;
}

export interface overwriteComputeBudgetProgramOptions {
  units: SetComputeUnitLimitParams['units'];
  microLamports: SetComputeUnitPriceParams['microLamports'];
}

export function overwriteComputeBudgetProgram<T extends Transaction | VersionedTransaction>(
  tx: T,
  budget?: overwriteComputeBudgetProgramOptions,
  blockHash?: string,
): T {
  const computeBudgetProgramId = ComputeBudgetProgram.programId.toBase58();

  if (!budget) {
    return tx;
  }

  const originalTx = deserializeTransaction(serializeTransaction(tx));

  const computeUnitLimitInstruction = ComputeBudgetProgram.setComputeUnitLimit({ units: budget.units });
  const computeUnitPriceInstruction = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: budget.microLamports });

  if ('version' in originalTx) {
    const originalMessage = originalTx.message;
    const newInstructions: TransactionInstruction[] = [];

    for (const ix of originalMessage.compiledInstructions) {
      const programId = originalMessage.staticAccountKeys[ix.programIdIndex];
      if (programId.toBase58() !== computeBudgetProgramId) {
        const keys = ix.accountKeyIndexes.map((i) => {
          const pubkey = originalMessage.staticAccountKeys[i];
          const isSigner = originalMessage.isAccountSigner(i);
          const isWritable = originalMessage.isAccountWritable(i);
          return { pubkey, isSigner, isWritable };
        });
        const data = Buffer.from(ix.data);

        newInstructions.push(
          new TransactionInstruction({
            programId,
            keys,
            data,
          }),
        );
      }
    }
    const payerKey = originalMessage.staticAccountKeys[0];
    const recentBlockhash = blockHash ?? originalMessage.recentBlockhash;

    const newMessageV0 = new TransactionMessage({
      payerKey,
      recentBlockhash,
      instructions: [...newInstructions, computeUnitLimitInstruction, computeUnitPriceInstruction],
    }).compileToV0Message();

    const newTx = new VersionedTransaction(newMessageV0);

    return newTx as T;
  } else {
    originalTx.instructions = originalTx.instructions.filter((ix) => ix.programId.toBase58() !== computeBudgetProgramId);
    originalTx.recentBlockhash = blockHash ?? originalTx.recentBlockhash;

    originalTx.add(computeUnitLimitInstruction, computeUnitPriceInstruction);

    return originalTx as T;
  }
}

export function signTransaction(transaction: Transaction | VersionedTransaction, privateKey: Uint8Array) {
  const tx = deserializeTransaction(serializeTransaction(transaction));
  const keypair = Keypair.fromSeed(privateKey);

  if ('version' in tx) {
    // VersionedTransaction
    tx.sign([keypair]);
  } else {
    // Legacy Transaction
    tx.sign(keypair);
  }

  return tx;
}

export function createTransferTransaction(from: string, to: string, amount: number, recentBlockhash: string) {
  const fromPubkey = new PublicKey(from);
  const toPubkey = new PublicKey(to);
  const lamports = Number(amount);

  const transferInstruction = SystemProgram.transfer({ fromPubkey, toPubkey, lamports });

  const messageV0 = new TransactionMessage({
    payerKey: fromPubkey,
    recentBlockhash,
    instructions: [transferInstruction],
  }).compileToV0Message();

  return new VersionedTransaction(messageV0);
}

interface CreateSplTokenTransferTransactionOptions {
  isAccountCreationNeeded?: boolean;
  programId?: string;
}

export function createSplTokenTransferTransaction(
  from: string,
  to: string,
  mint: string,
  amount: number,
  recentBlockhash: string,
  options?: CreateSplTokenTransferTransactionOptions,
) {
  const fromPubkey = new PublicKey(from);
  const toPubkey = new PublicKey(to);
  const mintPubkey = new PublicKey(mint);
  const lamports = Number(amount);
  const programId = options?.programId ? new PublicKey(options.programId) : undefined;

  const createAccountInstruction = createAssociatedTokenAccountInstruction(
    fromPubkey,
    getAssociatedTokenAddressSync(mintPubkey, toPubkey),
    toPubkey,
    mintPubkey,
  );

  const transferInstruction = createTransferInstruction(
    getAssociatedTokenAddressSync(mintPubkey, fromPubkey),
    getAssociatedTokenAddressSync(mintPubkey, toPubkey),
    fromPubkey,
    lamports,
    [],
    programId,
  );

  const instructions = options?.isAccountCreationNeeded ? [createAccountInstruction, transferInstruction] : [transferInstruction];

  const messageV0 = new TransactionMessage({
    payerKey: fromPubkey,
    recentBlockhash,
    instructions,
  }).compileToV0Message();

  return new VersionedTransaction(messageV0);
}
