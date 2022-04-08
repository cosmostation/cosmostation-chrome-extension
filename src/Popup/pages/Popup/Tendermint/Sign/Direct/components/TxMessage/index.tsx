import { isDirectCustom, isDirectSend } from '~/Popup/utils/proto';
import type { TendermintChain } from '~/types/chain';
import type { Msg } from '~/types/tendermint/proto';

import Custom from './messages/Custom';
import Send from './messages/Send';

type TxMessageProps = { chain: TendermintChain; msg: Msg };

export default function TxMessage({ chain, msg }: TxMessageProps) {
  if (isDirectSend(msg)) {
    return <Send msg={msg} chain={chain} />;
  }

  if (isDirectCustom(msg)) {
    return <Custom msg={msg} />;
  }
  return null;
}
