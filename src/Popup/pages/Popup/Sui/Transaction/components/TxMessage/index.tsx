import type { TransactionBlock } from '@mysten/sui.js';

import Transaction from './messages/Transaction';

type TxMessageProps = {
  transaction: TransactionBlock | string;
};

export default function TxMessage({ transaction }: TxMessageProps) {
  // NOTE FIX ME
  // if (typeof transaction === 'string') {
  //   return <Transaction transaction={transaction} />;
  // }

  // if (isPaySui(transaction)) {
  //   return <PaySui transaction={transaction.data} />;
  // }

  return <Transaction transaction={transaction} />;
}
