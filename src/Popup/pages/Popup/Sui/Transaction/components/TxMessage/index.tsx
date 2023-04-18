import type { TransactionBlock } from '@mysten/sui.js';

import Transaction from './messages/Transaction';

type TxMessageProps = {
  transactionBlock: TransactionBlock;
};

export default function TxMessage({ transactionBlock }: TxMessageProps) {
  return <Transaction transactionBlock={transactionBlock} />;
}
