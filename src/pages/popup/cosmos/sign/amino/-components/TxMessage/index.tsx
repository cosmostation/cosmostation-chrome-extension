import type { CosmosChain } from '@/types/chain';
import type { Msg, MsgCustom } from '@/types/cosmos/amino';
import { isAminoCommission, isAminoExecuteContract, isAminoIBCSend, isAminoReward, isAminoSend, isAminoSwapExactAmountIn } from '@/utils/cosmos/msg';

import Commission from './messages/Commission';
import Contract from './messages/Contract';
import Custom from './messages/Custom';
import IBCSend from './messages/IBCSend';
import Reward from './messages/Reward';
import Send from './messages/Send';
import Swap from './messages/Swap';

type TxMessageProps = { chain: CosmosChain; msgs: Msg[]; currentStep: number; onPageChange?: (page: number) => void };

export default function TxMessage({ chain, msgs, currentStep, onPageChange }: TxMessageProps) {
  const currentMsg = msgs[currentStep];

  if (isAminoSend(currentMsg)) {
    return <Send msg={currentMsg} chain={chain} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
  }

  if (isAminoIBCSend(currentMsg)) {
    return <IBCSend msg={currentMsg} chain={chain} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
  }

  if (isAminoReward(currentMsg)) {
    return <Reward msg={currentMsg} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
  }

  if (isAminoCommission(currentMsg)) {
    return <Commission msg={currentMsg} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
  }

  if (isAminoSwapExactAmountIn(currentMsg)) {
    return <Swap msg={currentMsg} chain={chain} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
  }

  if (isAminoExecuteContract(currentMsg)) {
    return <Contract msg={currentMsg} chain={chain} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
  }

  return <Custom msg={currentMsg as Msg<MsgCustom>} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
}
