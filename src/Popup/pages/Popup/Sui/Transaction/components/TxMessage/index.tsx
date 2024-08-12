import type { Transaction as TransactionType } from '@mysten/sui/transactions';

import Transaction from './messages/Transaction';

type TxMessageProps = {
  transaction: TransactionType;
};

export default function TxMessage({ transaction }: TxMessageProps) {
  return <Transaction transaction={transaction} />;
}
