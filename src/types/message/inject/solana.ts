import type { PublicKey } from '@solana/web3.js';

import type { SOLANA_METHOD_TYPE, SOLANA_NO_POPUP_METHOD_TYPE, SOLANA_POPUP_METHOD_TYPE } from '@/constants/solana/message';
import type { ChainType } from '@/types/chain';

import type { RequestBase } from '.';

export type SolanaRequest = SolanaConnect | SolanaDisconnect | SolanaSignMessage;

export interface SolanaResponse {
  [SOLANA_POPUP_METHOD_TYPE.SOLANA__CONNECT]: SolanaConnectResponse;
  [SOLANA_POPUP_METHOD_TYPE.SOLANA__SIGN_MESSAGE]: SolanaSignMessageResponse;
  [SOLANA_NO_POPUP_METHOD_TYPE.SOLANA__DISCONNECT]: SolanaDisconnectResponse;
}

export interface SolanaConnect extends RequestBase {
  chainType: Extract<ChainType, 'solana'>;
  method: typeof SOLANA_POPUP_METHOD_TYPE.SOLANA__CONNECT;
  params: undefined;
}

export type SolanaConnectResponse = {
  publicKey: PublicKey;
};

export interface SolanaDisconnect extends RequestBase {
  chainType: Extract<ChainType, 'solana'>;
  method: typeof SOLANA_NO_POPUP_METHOD_TYPE.SOLANA__DISCONNECT;
  params?: undefined;
}

export type SolanaDisconnectResponse = undefined;

export interface SolanaSingMessageParams {
  message: Uint8Array;
  display: 'utf8' | 'hex';
}

export interface SolanaSignMessage extends RequestBase {
  chainType: Extract<ChainType, 'solana'>;
  method: typeof SOLANA_METHOD_TYPE.SOLANA__SIGN_MESSAGE;
  params: SolanaSingMessageParams;
}

export type SolanaSignMessageResponse = {
  signature: Uint8Array;
  publicKey: PublicKey;
};
