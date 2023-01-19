import { isAminoCustom, isAminoIBCSend, isAminoReward, isAminoSend, isAminoSwapExactAmountIn } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { Msg } from '~/types/cosmos/amino';

import Custom from './messages/Custom';
import IBCSend from './messages/IBCSend';
import Reward from './messages/Reward';
import Send from './messages/Send';
import Swap from './messages/Swap';

type TxMessageProps = { chain: CosmosChain; msg: Msg; isMultipleMsgs: boolean };

export default function TxMessage({ chain, msg, isMultipleMsgs }: TxMessageProps) {
  if (isAminoSend(msg)) {
    return <Send msg={msg} chain={chain} isMultipleMsgs={isMultipleMsgs} />;
  }

  if (isAminoIBCSend(msg)) {
    return <IBCSend msg={msg} chain={chain} isMultipleMsgs={isMultipleMsgs} />;
  }

  if (isAminoReward(msg)) {
    return <Reward msg={msg} isMultipleMsgs={isMultipleMsgs} />;
  }

  if (isAminoSwapExactAmountIn(msg)) {
    return <Swap msg={msg} isMultipleMsgs={isMultipleMsgs} />;
  }

  if (isAminoCustom(msg)) {
    return <Custom msg={msg} isMultipleMsgs={isMultipleMsgs} />;
  }
  return null;
}
