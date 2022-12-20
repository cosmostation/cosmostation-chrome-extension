import type { SignableTransaction } from '@mysten/sui.js';

import Transaction from './messages/Transaction';

type TxMessageProps = {
  transaction: SignableTransaction;
};

export default function TxMessage({ transaction }: TxMessageProps) {
  return <Transaction transaction={transaction} />;
}
