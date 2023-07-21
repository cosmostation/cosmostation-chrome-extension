import { isDirectCommission, isDirectCustom, isDirectIBCSend, isDirectSend } from '~/Popup/utils/proto';
import type { CosmosChain } from '~/types/chain';
import type { Msg } from '~/types/cosmos/proto';

import Commission from './messages/Commission';
import Custom from './messages/Custom';
import IBCSend from './messages/IBCSend';
import Send from './messages/Send';

type TxMessageProps = { chain: CosmosChain; msg: Msg; isMultipleMsgs: boolean };

export default function TxMessage({ chain, msg, isMultipleMsgs }: TxMessageProps) {
  if (isDirectSend(msg)) {
    return <Send msg={msg} chain={chain} isMultipleMsgs={isMultipleMsgs} />;
  }

  if (isDirectIBCSend(msg)) {
    return <IBCSend msg={msg} chain={chain} isMultipleMsgs={isMultipleMsgs} />;
  }

  if (isDirectCommission(msg)) {
    return <Commission msg={msg} isMultipleMsgs={isMultipleMsgs} />;
  }

  if (isDirectCustom(msg)) {
    return <Custom msg={msg} isMultipleMsgs={isMultipleMsgs} />;
  }
  return null;
}
