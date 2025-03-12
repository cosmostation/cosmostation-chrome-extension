import DefaultTx from './messages/DefaultTx';

export type TxMessageProps = { displayTxString: string };

export default function TxMessage({ displayTxString }: TxMessageProps) {
  return <DefaultTx displayTxString={displayTxString} />;
}
