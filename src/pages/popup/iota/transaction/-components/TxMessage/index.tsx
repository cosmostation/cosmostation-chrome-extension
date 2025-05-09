import type { Transaction } from '@iota/iota-sdk/transactions';

import DefaultTx from './messages/DefaultTx';

export type TxMessageProps = { tx: Transaction };

export default function TxMessage({ tx }: TxMessageProps) {
  return <DefaultTx tx={tx} />;
}
