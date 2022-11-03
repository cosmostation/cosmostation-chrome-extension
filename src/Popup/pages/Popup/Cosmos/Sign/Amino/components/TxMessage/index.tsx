import { isAminoCustom, isAminoSend, isIBCSend } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { Msg } from '~/types/cosmos/amino';

import Custom from './messages/Custom';
import IBCSend from './messages/IBCSend';
import Send from './messages/Send';

type TxMessageProps = { chain: CosmosChain; msg: Msg };

export default function TxMessage({ chain, msg }: TxMessageProps) {
  if (isAminoSend(msg)) {
    return <Send msg={msg} chain={chain} />;
  }

  if (isIBCSend(msg)) {
    return <IBCSend msg={msg} chain={chain} />;
  }

  if (isAminoCustom(msg)) {
    return <Custom msg={msg} />;
  }
  return null;
}
