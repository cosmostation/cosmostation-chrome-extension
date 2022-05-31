/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DetermineTxType } from '~/Popup/background/ethereum';
import type { EthereumChain, TendermintChain } from '~/types/chain';
import type { EthereumTx } from '~/types/ethereum/message';
import type { Msg } from '~/types/tendermint/amino';

import Send from './messages/Send';

export type TxMessageProps = { determineTxType?: DetermineTxType; tx: EthereumTx };

export default function TxMessage({ determineTxType, tx }: TxMessageProps) {
  if (determineTxType?.type === 'simpleSend') {
    return <Send determineTxType={determineTxType} tx={tx} />;
  }
  return null;
}
