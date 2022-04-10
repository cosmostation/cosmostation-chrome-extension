import { isAminoCustom, isAminoSend } from '~/Popup/utils/tendermint';
import type { TendermintChain } from '~/types/chain';
import type { Msg } from '~/types/tendermint/amino';

import Custom from './messages/Custom';
import Send from './messages/Send';

type TxMessageProps = { chain: TendermintChain; msg: Msg };

export default function TxMessage({ chain, msg }: TxMessageProps) {
  if (isAminoSend(msg)) {
    return <Send msg={msg} chain={chain} />;
  }

  if (isAminoCustom(msg)) {
    return <Custom msg={msg} />;
  }
  return null;
}
