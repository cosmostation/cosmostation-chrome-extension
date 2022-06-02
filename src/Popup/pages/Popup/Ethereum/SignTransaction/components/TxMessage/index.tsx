import type { DetermineTxType } from '~/Popup/utils/ethereum';
import type { EthereumTx } from '~/types/ethereum/message';

import Send from './messages/Send';

export type TxMessageProps = { determineTxType?: DetermineTxType; tx: EthereumTx };

export default function TxMessage({ determineTxType, tx }: TxMessageProps) {
  if (determineTxType?.type === 'simpleSend') {
    return <Send determineTxType={determineTxType} tx={tx} />;
  }
  return null;
}
