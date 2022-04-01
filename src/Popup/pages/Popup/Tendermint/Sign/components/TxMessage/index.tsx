import { isCustom, isSend } from '~/Popup/utils/tendermint';
import type { TendermintChain } from '~/types/chain';
import type { Msg } from '~/types/tendermint/amino';

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
