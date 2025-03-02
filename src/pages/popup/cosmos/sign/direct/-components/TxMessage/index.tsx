import type { CosmosChain } from '@/types/chain';
import type { Msg } from '@/types/cosmos/direct';
import { isDirectCommission, isDirectExecuteContract, isDirectIBCSend, isDirectSend } from '@/utils/cosmos/proto';

import Commission from './messages/Commission';
import Contract from './messages/Contract';
import Custom from './messages/Custom';
import IBCSend from './messages/IBCSend';
import Send from './messages/Send';

type TxMessageProps = { chain: CosmosChain; msgs: Msg[]; currentStep: number; onPageChange?: (page: number) => void };

export default function TxMessage({ chain, msgs, currentStep, onPageChange }: TxMessageProps) {
  const currentMsg = msgs[currentStep];

  if (isDirectSend(currentMsg)) {
    return <Send msg={currentMsg} chain={chain} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
  }

  if (isDirectIBCSend(currentMsg)) {
    return <IBCSend msg={currentMsg} chain={chain} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
  }

  if (isDirectCommission(currentMsg)) {
    return <Commission msg={currentMsg} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
  }

  if (isDirectExecuteContract(currentMsg)) {
    return <Contract msg={currentMsg} chain={chain} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
  }

  return <Custom msg={currentMsg} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
}
