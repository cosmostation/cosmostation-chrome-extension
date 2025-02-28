import type { CosmosChain } from '@/types/chain';
import type { Msg } from '@/types/cosmos/amino';
import { isAminoSend } from '@/utils/cosmos/msg';

import Send from './messages/Send';

type TxMessageProps = { chain: CosmosChain; msgs: Msg[]; currentStep: number; onPageChange?: (page: number) => void };

export default function TxMessage({ chain, msgs, currentStep, onPageChange }: TxMessageProps) {
  const currentMsg = msgs[currentStep];

  if (isAminoSend(currentMsg)) {
    return <Send msg={currentMsg} chain={chain} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
  }

  // if (isAminoIBCSend(currentMsg)) {
  //   return <IBCSend msg={currentMsg} chain={chain} isMultipleMsgs={isMultipleMsgs} />;
  // }

  // if (isAminoReward(currentMsg)) {
  //   return <Reward msg={currentMsg} isMultipleMsgs={isMultipleMsgs} />;
  // }

  // if (isAminoCommission(currentMsg)) {
  //   return <Commission msg={currentMsg} isMultipleMsgs={isMultipleMsgs} />;
  // }

  // if (isAminoSwapExactAmountIn(currentMsg)) {
  //   return <Swap msg={currentMsg} chain={chain} isMultipleMsgs={isMultipleMsgs} />;
  // }

  // if (isAminoExecuteContract(currentMsg)) {
  //   return <Contract msg={currentMsg} chain={chain} isMultipleMsgs={isMultipleMsgs} />;
  // }

  // if (isAminoCustom(currentMsg)) {
  //   return <Custom msg={currentMsg} isMultipleMsgs={isMultipleMsgs} />;
  // }
  return null;
}
