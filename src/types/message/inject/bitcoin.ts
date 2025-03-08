import type { Network } from '@/constants/bitcoin/common';
import type { BITCOIN_NO_POPUP_METHOD_TYPE, BITCOIN_POPUP_METHOD_TYPE } from '@/constants/bitcoin/message';
import type { ChainType } from '@/types/chain';

import type { RequestBase } from '.';

export type BitcoinRequest =
  | BitRequestAccount
  | BitGetAddress
  | BitSwitchNetwork
  | BitcSwitchNetwork
  | BitGetNetwork
  | BitGetPublicKeyHex
  | BitGetBalance
  | BitPushTx
  | BitSendBitcoin
  | BitSignMessage
  | BitSignPsbt
  | BitSignPsbts;

export interface BitcoinResponse {
  [BITCOIN_POPUP_METHOD_TYPE.BIT__REQUEST_ACCOUNT]: BitRequestAccountResponse;
  [BITCOIN_NO_POPUP_METHOD_TYPE.BIT__GET_ADDRESS]: BitGetAddressResponse;
  [BITCOIN_POPUP_METHOD_TYPE.BIT__SWITCH_NETWORK]: BitSwitchNetworkResponse;
  [BITCOIN_POPUP_METHOD_TYPE.BITC__SWITCH_NETWORK]: BitSwitchNetworkResponse;
  [BITCOIN_NO_POPUP_METHOD_TYPE.BIT__GET_NETWORK]: BitGetAddressResponse;
  [BITCOIN_NO_POPUP_METHOD_TYPE.BIT_GET_PUBLICKKEY_HEX]: BitGetPublicKeyHexResponse;
  [BITCOIN_NO_POPUP_METHOD_TYPE.BIT_GET_BALANCE]: BitGetBalanceResponse;
  [BITCOIN_NO_POPUP_METHOD_TYPE.BIT__PUSH_TX]: BitPushTxResponse;
  [BITCOIN_POPUP_METHOD_TYPE.BIT__SEND_BITCOIN]: BitSendBitcoinResponse;
  [BITCOIN_POPUP_METHOD_TYPE.BIT__SIGN_MESSAGE]: BitSignMessageResposne;
  [BITCOIN_POPUP_METHOD_TYPE.BIT__SIGN_PSBT]: BitSignPsbtResposne;
  [BITCOIN_POPUP_METHOD_TYPE.BIT__SIGN_PSBTS]: BitSignPsbtsResposne;
}

export type BitRequestAccountResponse = string[];

export interface BitRequestAccount extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__REQUEST_ACCOUNT;
  params?: undefined;
}

export type BitGetAddressResponse = string;

export interface BitGetAddress extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_NO_POPUP_METHOD_TYPE.BIT__GET_ADDRESS;
  params?: undefined;
}

export type BitSwitchNetworkResponse = 'mainnet' | 'signet';

export interface BitSwitchNetwork extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SWITCH_NETWORK;
  params: [Network];
}

export interface BitcSwitchNetwork extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BITC__SWITCH_NETWORK;
  params: [Network];
}

export type BitGetInscriptionsResponse = Network;

export interface BitGetNetwork extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_NO_POPUP_METHOD_TYPE.BIT__GET_NETWORK;
  params?: undefined;
}

export type BitGetPublicKeyHexResponse = string;

export interface BitGetPublicKeyHex extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_NO_POPUP_METHOD_TYPE.BIT_GET_PUBLICKKEY_HEX;
  params?: undefined;
}

export type BitGetBalanceResponse = number;

export interface BitGetBalance extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_NO_POPUP_METHOD_TYPE.BIT_GET_BALANCE;
  params?: undefined;
}

export type BitPushTxResponse = string;

export interface BitPushTx extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_NO_POPUP_METHOD_TYPE.BIT__PUSH_TX;
  params: [string];
}

export type BitSendBitcoinParams = {
  to: string;
  satAmount: number;
};
export type BitSendBitcoinResponse = string;

export interface BitSendBitcoin extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SEND_BITCOIN;
  params: BitSendBitcoinParams;
}

export type BitSignMessageParams = {
  message: string;
  type?: 'ecdsa' | 'bip322-simple';
};
export type BitSignMessageResposne = string;

export interface BitSignMessage extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SIGN_MESSAGE;
  params: BitSignMessageParams;
}

export type BitSignPsbtParams = string;
export type BitSignPsbtResposne = string;

export interface BitSignPsbt extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SIGN_PSBT;
  params: BitSignPsbtParams;
}

export type BitSignPsbtsParams = string[];
export type BitSignPsbtsResposne = string[];

export interface BitSignPsbts extends RequestBase {
  chainType: Extract<ChainType, 'bitcoin'>;
  method: typeof BITCOIN_POPUP_METHOD_TYPE.BIT__SIGN_PSBTS;
  params: BitSignPsbtsParams;
}
