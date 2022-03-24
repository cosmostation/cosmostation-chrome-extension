import type { TendermintChain } from '~/types/chain';
import type { Msg, Send } from '~/types/tendermint/amino';

import Custom from './messages/Custom';

type TxMessageProps = { chain: TendermintChain; msg: Msg };

export default function TxMessage({ chain, msg }: TxMessageProps) {
  if (isCustom(msg)) {
    return <Custom msg={msg} />;
  }
  return null;
}

function isCustom(msg: Msg): msg is Msg<Record<string | number, unknown>> {
  return true;
}

function isSend(msg: Msg): msg is Msg<Send> {
  return msg.type === 'cosmos-sdk/MsgSend';
}
