import type { Types } from 'aptos';
import { sha3_256 as sha3 } from '@noble/hashes/sha3';
import { bytesToHex } from '@noble/hashes/utils';

export function getAddress(publicKey: Buffer) {
  const hash = sha3.create();
  hash.update(publicKey);
  hash.update('\x00');

  const address = `0x${bytesToHex(hash.digest())}`;

  return address;
}

export function getCoinAddress(type: string) {
  const startIndex = type.indexOf('<');
  const endIndex = type.indexOf('>');

  if (startIndex > -1 && endIndex > -1) {
    return type.substring(startIndex + 1, endIndex);
  }

  return '';
}

export function castTransactionType(tx?: Types.Transaction) {
  if (!tx) {
    return undefined;
  }

  if (tx.type === 'pending_transaction') {
    return tx as {
      type: 'pending_transaction';
    } & Types.PendingTransaction;
  }

  if (tx.type === 'user_transaction') {
    return tx as {
      type: 'user_transaction';
    } & Types.UserTransaction;
  }

  if (tx.type === 'genesis_transaction') {
    return tx as {
      type: 'genesis_transaction';
    } & Types.UserTransaction;
  }

  if (tx.type === 'block_metadata_transaction') {
    return tx as {
      type: 'block_metadata_transaction';
    } & Types.UserTransaction;
  }

  if (tx.type === 'state_checkpoint_transaction') {
    return tx as {
      type: 'state_checkpoint_transaction';
    } & Types.UserTransaction;
  }

  return undefined;
}
