import type { AptosSignPayload } from '~/types/message/aptos';

import Transaction from './messages/Transaction';

type TxMessageProps = {
  payload: AptosSignPayload;
};

export default function TxMessage({ payload }: TxMessageProps) {
  return <Transaction payload={payload} />;
}
