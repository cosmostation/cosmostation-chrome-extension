import type { TransactionResponse } from '@aptos-labs/ts-sdk';
import {
  Deserializer,
  isBlockEpilogueTransactionResponse,
  isBlockMetadataTransactionResponse,
  isStateCheckpointTransactionResponse,
  isUserTransactionResponse,
  isValidatorTransactionResponse,
  SimpleTransaction,
} from '@aptos-labs/ts-sdk';

import type { AccountTx } from '@/types/aptos/tx';
import { formatDateForHistory, getTimestampValue, isUnixTimestamp } from '@/utils/date';

export function formatAptosTxTimestamp(tx: TransactionResponse) {
  const txResponse = isCommittedTransactionResponse(tx) || null;

  if (txResponse) {
    return formatDateForHistory(txResponse.timestamp);
  }

  return '';
}

export function isCommittedTransactionResponse(tx: TransactionResponse): AccountTx | undefined {
  if (
    isUserTransactionResponse(tx) ||
    isBlockMetadataTransactionResponse(tx) ||
    isStateCheckpointTransactionResponse(tx) ||
    isValidatorTransactionResponse(tx) ||
    isBlockEpilogueTransactionResponse(tx)
  ) {
    return tx;
  }

  return undefined;
}

export function getLocalTime(tx: TransactionResponse) {
  const txResponse = isCommittedTransactionResponse(tx) || null;
  if (txResponse) {
    const normalizedTxTime = isUnixTimestamp(txResponse.timestamp) ? getTimestampValue(txResponse.timestamp) : txResponse.timestamp;

    const date = new Date(normalizedTxTime);

    return `${date.getHours().toString().padStart(2, '0')} : ${date.getMinutes().toString().padStart(2, '0')} :${date.getSeconds().toString().padStart(2, '0')}`;
  }

  return '';
}

export function getTimestamp(tx: TransactionResponse) {
  const txResponse = isCommittedTransactionResponse(tx) || null;

  if (txResponse?.timestamp) {
    return txResponse.timestamp;
  }

  return '';
}

export function getOriginalTx(serializedTxHex: string) {
  const _signDoc = Uint8Array.from(Buffer.from(serializedTxHex, 'hex'));
  const deserializer = new Deserializer(_signDoc);
  const originTx = deserializer.deserialize(SimpleTransaction);

  return originTx;
}
