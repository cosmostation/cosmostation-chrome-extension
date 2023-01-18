import { isAminoCustom, isAminoIBCSend, isAminoReward, isAminoSend, isAminoSwapExactAmountIn } from '~/Popup/utils/cosmos';
import type { CosmosChain } from '~/types/chain';
import type { Msg } from '~/types/cosmos/amino';

import Custom from './messages/Custom';
import IBCSend from './messages/IBCSend';
import Reward from './messages/Reward';
import Send from './messages/Send';
import Swap from './messages/Swap';

type TxMessageProps = { chain: CosmosChain; msg: Msg; msgLength: number };

export default function TxMessage({ chain, msg, msgLength }: TxMessageProps) {
  if (isAminoSend(msg)) {
    return <Send msg={msg} chain={chain} msgLength={msgLength} />;
  }

  if (isAminoIBCSend(msg)) {
    return <IBCSend msg={msg} chain={chain} />;
  }

  if (isAminoReward(msg)) {
    return <Reward msg={msg} />;
  }

  if (isAminoSwapExactAmountIn(msg)) {
    return <Swap msg={msg} />;
  }

  if (isAminoCustom(msg)) {
    return <Custom msg={msg} />;
  }
  return null;
}
