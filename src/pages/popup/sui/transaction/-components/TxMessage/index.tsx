import type { Transaction } from '@mysten/sui/transactions';

import DefaultTx from './messages/DefaultTx';

export type TxMessageProps = { tx: Transaction };

export default function TxMessage({ tx }: TxMessageProps) {
  return <DefaultTx tx={tx} />;
}
