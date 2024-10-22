import type { BITCOIN_POPUP_METHOD_TYPE } from '~/constants/message/bitcoin';

export type BitSignAndSendTransaction = {
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SIGN_AND_SEND_TRANSACTION;
  params: [string];
  id?: string | number;
};
