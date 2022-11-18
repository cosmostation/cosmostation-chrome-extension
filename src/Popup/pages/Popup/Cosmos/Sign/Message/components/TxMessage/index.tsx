import { isAminoMsgSignData } from '~/Popup/utils/cosmos';
import type { Msg } from '~/types/cosmos/amino';

import Message from './messages/Message';

type TxMessageProps = { msg: Msg };

export default function TxMessage({ msg }: TxMessageProps) {
  if (isAminoMsgSignData(msg)) {
    return <Message msg={msg} />;
  }
  return null;
}
