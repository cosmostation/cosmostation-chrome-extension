import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

import { isVersionedTransaction } from './util';
import { divide, gt, minus } from '../numbers';

export interface TokenChange {
  mint: string;
  symbol?: string;
  amount: string;
  decimals: number;
  type: 'send' | 'receive';
}

const getAccountsToTrack = (transaction: VersionedTransaction | Transaction, userAddress: string) => {
  const accounts = new Set([userAddress]);

  if ('version' in transaction) {
    const versionedTx = transaction as VersionedTransaction;

    versionedTx.message.staticAccountKeys.forEach((key) => {
      accounts.add(key.toString());
    });

    if (versionedTx.message.addressTableLookups) {
      versionedTx.message.addressTableLookups.forEach((lookup) => {
        accounts.add(lookup.accountKey.toString());
      });
    }
  } else {
    const legacyTx = transaction as Transaction;

    legacyTx.instructions.forEach((instruction) => {
      accounts.add(instruction.programId.toString());

      instruction.keys.forEach((key) => {
        accounts.add(key.pubkey.toString());
      });
    });
  }

  return Array.from(accounts);
};

const isTokenProgram = (owner: string) => owner === TOKEN_PROGRAM_ID.toBase58() || owner === TOKEN_2022_PROGRAM_ID.toBase58();

const parseTokenAccount = (data: Buffer | null, owner: string) => {
  if (!data || !isTokenProgram(owner)) return null;

  try {
    const mint = new PublicKey(data.slice(0, 32));
    const owner = new PublicKey(data.slice(32, 64));
    const amount = data.readBigUInt64LE(64).toString();

    return {
      mint: mint.toString(),
      owner: owner.toString(),
      amount: amount,
    };
  } catch {
    return undefined;
  }
};

const analyzeAccountChanges = (
  accountsBefore: { lamports: number; data: Buffer | null; owner: string; address?: string; exists: boolean }[],
  accountsAfter: { lamports: number; data: Buffer | null; owner: string; exists: boolean }[],
  userAddress: string,
  accountAddresses: string[],
): TokenChange[] => {
  const changes: TokenChange[] = [];

  for (let i = 0; i < accountsBefore.length; i++) {
    const before = accountsBefore[i];
    const after = accountsAfter[i];
    const address = accountAddresses[i];

    if (!before || !after) continue;

    if (address === userAddress) {
      const solDiff = minus(after.lamports, before.lamports);
      if (solDiff !== '0') {
        changes.push({
          mint: 'sol',
          symbol: 'SOL',
          amount: divide(solDiff, LAMPORTS_PER_SOL),
          decimals: 9,
          type: gt(solDiff, 0) ? 'receive' : 'send',
        });
      }
    }

    const beforeToken = parseTokenAccount(before.data, before.owner);
    const afterToken = parseTokenAccount(after.data, after.owner);

    if (beforeToken && afterToken && beforeToken.owner === userAddress && beforeToken.mint === afterToken.mint) {
      const tokenDiff = minus(afterToken.amount, beforeToken.amount);

      if (tokenDiff !== '0') {
        changes.push({
          mint: beforeToken.mint,
          amount: tokenDiff,
          decimals: 0,
          type: gt(tokenDiff, '0') ? 'receive' : 'send',
        });
      }
    } else if (!before.exists && after.exists && afterToken && afterToken.owner === userAddress) {
      if (gt(afterToken.amount, 0)) {
        changes.push({
          mint: afterToken.mint,
          amount: afterToken.amount,
          decimals: 0,
          type: 'receive',
        });
      }
    } else if (before.exists && !after.exists && beforeToken && beforeToken.owner === userAddress) {
      if (gt(beforeToken.amount, 0)) {
        changes.push({
          mint: beforeToken.mint,
          amount: beforeToken.amount,
          decimals: 0,
          type: 'send',
        });
      }
    }
  }

  return changes;
};

export const analyzeTokenChanges = async (connection: Connection, transaction: VersionedTransaction | Transaction, userAddress: string) => {
  try {
    const accountsToTrack = getAccountsToTrack(transaction, userAddress);

    const accountInfosBefore = await getMultipleAccounts(connection, accountsToTrack);

    const { value: simulatedValue } = isVersionedTransaction(transaction)
      ? await connection.simulateTransaction(transaction, {
          sigVerify: false,
          accounts: {
            encoding: 'base64',
            addresses: accountsToTrack,
          },
        })
      : await connection.simulateTransaction(
          transaction,
          undefined,
          accountsToTrack.map((addr) => new PublicKey(addr)),
        );

    if (simulatedValue.err) {
      throw new Error(`Transaction simulation failed: ${JSON.stringify(simulatedValue.err)}`);
    }

    const accountInfosAfter =
      simulatedValue.accounts?.map((account) => ({
        lamports: account?.lamports || 0,
        data: account?.data ? Buffer.from(account.data[0], account.data[1] as BufferEncoding) : null,
        owner: account?.owner || '',
        exists: !!account,
      })) || [];

    const changes = analyzeAccountChanges(accountInfosBefore, accountInfosAfter, userAddress, accountsToTrack);

    return changes;
  } catch {
    return undefined;
  }
};

export const getMultipleAccounts = async (connection: Connection, addresses: string[]) => {
  try {
    const resolvedAddresses = addresses.map((item) => new PublicKey(item));
    const info = await connection.getMultipleAccountsInfo(resolvedAddresses);

    return info.map((item, i) => {
      return {
        lamports: item?.lamports || 0,
        data: item?.data || null,
        owner: item?.owner.toString() || '',
        address: addresses[i],
        exists: !!item,
      };
    });
  } catch {
    return addresses.map((item) => ({
      lamports: 0,
      data: null,
      owner: '',
      address: item,
      exists: false,
    }));
  }
};
