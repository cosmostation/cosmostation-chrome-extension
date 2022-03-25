import type { TendermintChain } from '~/types/chain';
import type { Msg, MsgCustom, MsgSend } from '~/types/tendermint/amino';

import Custom from './messages/Custom';
import Send from './messages/Send';

type TxMessageProps = { chain: TendermintChain; msg: Msg };

export default function TxMessage({ chain, msg }: TxMessageProps) {
  if (isSend(msg)) {
    return <Send msg={msg} chain={chain} />;
  }

  if (isCustom(msg)) {
    return <Custom msg={msg} />;
  }
  return null;
}

function isCustom(msg: Msg): msg is Msg<MsgCustom> {
  return true;
}

function isSend(msg: Msg): msg is Msg<MsgSend> {
  return msg.type === 'cosmos-sdk/MsgSend';
}
