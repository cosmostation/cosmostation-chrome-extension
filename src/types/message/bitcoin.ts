import type { Network } from '~/constants/bitcoin';
import type { BITCOIN_NO_POPUP_METHOD_TYPE, BITCOIN_POPUP_METHOD_TYPE } from '~/constants/message/bitcoin';

export type BitRequestAccountResponse = string[];

export type BitRequestAccount = {
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__REQUEST_ACCOUNT;
  params?: undefined;
  id?: string | number;
};

export type BitGetAddressResponse = string;

export type BitGetAddress = {
  method: typeof BITCOIN_NO_POPUP_METHOD_TYPE.BIT__GET_ADDRESS;
  params?: undefined;
  id?: string | number;
};

export type BitSwitchNetwork = {
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SWITCH_NETWORK;
  params: [Network];
  id?: string | number;
};

export type BitcSwitchNetwork = {
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BITC__SWITCH_NETWORK;
  params: [Network];
  id?: string | number;
};

export type BitGetNetwork = {
  method: typeof BITCOIN_NO_POPUP_METHOD_TYPE.BIT__GET_NETWORK;
  params?: undefined;
  id?: string | number;
};

export type BitGetPublicKeyHex = {
  method: typeof BITCOIN_NO_POPUP_METHOD_TYPE.BIT_GET_PUBLICKKEY_HEX;
  params?: undefined;
  id?: string | number;
};

export type BitGetBalanceResponse = number;

export type BitGetBalance = {
  method: typeof BITCOIN_NO_POPUP_METHOD_TYPE.BIT_GET_BALANCE;
  params?: undefined;
  id?: string | number;
};

export type BitPushTxResponse = string;

export type BitPushTx = {
  method: typeof BITCOIN_NO_POPUP_METHOD_TYPE.BIT__PUSH_TX;
  params: [string];
  id?: string | number;
};

export type BitSendBitcoinParams = {
  to: string;
  satAmount: number;
};
export type BitSendBitcoinResponse = string;

export type BitSendBitcoin = {
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SEND_BITCOIN;
  params: BitSendBitcoinParams;
  id?: string | number;
};

export type BitSignMessageParams = {
  message: string;
  type?: 'ecdsa' | 'bip322-simple';
};
export type BitSignMessageResposne = string;

export type BitSignMessage = {
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SIGN_MESSAGE;
  params: BitSignMessageParams;
  id?: string | number;
};

export type BitSignPsbtParams = string;
export type BitSignPsbtResposne = string;

export type BitSignPsbt = {
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SIGN_PSBT;
  params: BitSignPsbtParams;
  id?: string | number;
};

export type BitSignPsbtsParams = string[];
export type BitSignPsbtsResposne = string[];

export type BitSignPsbts = {
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SIGN_PSBTS;
  params: BitSignPsbtsParams;
  id?: string | number;
};

export type BitSignAndSendTransaction = {
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SIGN_AND_SEND_TRANSACTION;
  params: [string];
  id?: string | number;
};
