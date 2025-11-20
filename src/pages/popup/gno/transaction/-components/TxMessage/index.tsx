import type { Message } from '@/types/message/inject/gno';

import Custom from './messages/Custom';

type TxMessageProps = { msgs: Message[]; currentStep: number; onPageChange?: (page: number) => void };

export default function TxMessage({ msgs, currentStep, onPageChange }: TxMessageProps) {
  const currentMsg = msgs[currentStep];

  return <Custom msg={currentMsg} currentStep={currentStep} totalSteps={msgs.length} onPageChange={onPageChange} />;
}
