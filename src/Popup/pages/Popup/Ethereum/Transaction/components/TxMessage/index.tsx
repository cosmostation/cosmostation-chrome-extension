import type { DetermineTxType } from '~/Popup/utils/ethereum';
import type { EthereumTx } from '~/types/ethereum/message';

import Approve from './messages/Approve';
import Deploy from './messages/Deploy';
import Interact from './messages/Interact';
import Send from './messages/Send';
import Transfer from './messages/Transfer';
import TransferFrom from './messages/TransferFrom';

export type TxMessageProps = { determineTxType?: DetermineTxType; tx: EthereumTx };

export default function TxMessage({ determineTxType, tx }: TxMessageProps) {
  if (determineTxType?.erc20 && determineTxType?.type === 'approve') {
    return <Approve determineTxType={determineTxType} tx={tx} />;
  }

  if (determineTxType?.erc20 && determineTxType?.type === 'transfer') {
    return <Transfer determineTxType={determineTxType} tx={tx} />;
  }

  if (determineTxType?.erc20 && determineTxType?.type === 'transferfrom') {
    return <TransferFrom determineTxType={determineTxType} tx={tx} />;
  }

  if (determineTxType?.type === 'simpleSend') {
    return <Send determineTxType={determineTxType} tx={tx} />;
  }

  if (determineTxType?.type === 'contractDeployment') {
    return <Deploy determineTxType={determineTxType} tx={tx} />;
  }

  if (determineTxType?.type === 'contractInteraction') {
    return <Interact determineTxType={determineTxType} tx={tx} />;
  }

  return null;
}
