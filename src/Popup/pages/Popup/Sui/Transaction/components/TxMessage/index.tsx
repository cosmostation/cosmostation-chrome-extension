import type { TransactionBlock } from '@mysten/sui.js';

import Transaction from './messages/Transaction';

type TxMessageProps = {
  transaction: TransactionBlock;
};

export default function TxMessage({ transaction }: TxMessageProps) {
  return <Transaction transaction={transaction} />;
}
