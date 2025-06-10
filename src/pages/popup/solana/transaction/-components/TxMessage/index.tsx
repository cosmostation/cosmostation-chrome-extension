import DefaultTx from './messages/DefaultTx';

export type TxMessageProps = { tx: string };

export default function TxMessage({ tx }: TxMessageProps) {
  return <DefaultTx tx={tx} />;
}
