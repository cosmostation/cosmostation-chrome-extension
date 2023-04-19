import type { DetermineTxType } from '~/Popup/utils/ethereum';
import type { EthereumTx } from '~/types/message/ethereum';

import Approve from './messages/Approve';
import Deploy from './messages/Deploy';
import Interact from './messages/Interact';
import OneInchSwap from './messages/OneInchSwap';
import Send from './messages/Send';
import Transfer from './messages/Transfer';
import TransferFrom from './messages/TransferFrom';

export type TxMessageProps = { determineTxType?: DetermineTxType; tx: EthereumTx };

export default function TxMessage({ determineTxType, tx }: TxMessageProps) {
  if (determineTxType?.txDescription && determineTxType.contractKind === 'erc20' && determineTxType?.type === 'approve') {
    return <Approve determineTxType={determineTxType} tx={tx} />;
  }

  if (determineTxType?.txDescription && determineTxType.contractKind === 'erc20' && determineTxType?.type === 'transfer') {
    return <Transfer determineTxType={determineTxType} tx={tx} />;
  }

  if (determineTxType?.txDescription && determineTxType.contractKind === 'erc20' && determineTxType?.type === 'transferfrom') {
    return <TransferFrom determineTxType={determineTxType} tx={tx} />;
  }

  if (determineTxType?.type === 'simpleSend') {
    return <Send determineTxType={determineTxType} tx={tx} />;
  }

  if (determineTxType?.type === 'contractDeployment') {
    return <Deploy determineTxType={determineTxType} tx={tx} />;
  }

  if (
    determineTxType?.txDescription &&
    determineTxType.contractKind === 'oneInch' &&
    (determineTxType?.type === 'swap' || determineTxType?.type === 'unoswap')
  ) {
    return <OneInchSwap determineTxType={determineTxType} tx={tx} />;
  }

  if (determineTxType?.type === 'contractInteraction') {
    return <Interact determineTxType={determineTxType} tx={tx} />;
  }

  return null;
}
