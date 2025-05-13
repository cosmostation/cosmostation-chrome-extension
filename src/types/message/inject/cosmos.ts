import type { COSMOS_METHOD_TYPE, COSMOS_NO_POPUP_METHOD_TYPE, COSMOS_POPUP_METHOD_TYPE } from '@/constants/cosmos/message';
import type { CosmosCw20Asset } from '@/types/asset';
import type { ChainType, CosmosType } from '@/types/chain';
import type { PubKey, PublicKeyType } from '@/types/cosmos';
import type { SignAminoDoc } from '@/types/cosmos/amino';
import type { SignDirectDoc } from '@/types/cosmos/direct';
import type { AddChainGasRate } from '@/types/fee';
import type { RequestBase } from '@/types/message/inject';

export type CosmosRequest =
  | CosSupportedChainNames
  | CosSupportedChainIds
  | CosActivatedChainIds
  | CosAccount
  | CosAddTokensCW20
  | CosRequestAccount
  | CosRequestAccounts
  | CosRequestAccountsSettled
  | CosSignAmino
  | CosSupportedChainIds
  | CosRequestAddChain
  | CosSignDirect
  | CosSendTransaction
  | CosSignMessage
  | CosVerifyMessage
  | CosAddNFTsCW721
  | CosGetBalanceCW20
  | CosGetTokenInfoCW20
  | CosAddTokensCW20
  | CosAddTokensCW20Internal
  | CosActivatedChainNames
  | CosDisconnect;

export interface CosmosResponse {
  [COSMOS_METHOD_TYPE.COS__SUPPORTED_CHAIN_NAMES]: CosSupportedChainNamesResponse;
  [COSMOS_METHOD_TYPE.COS__SUPPORTED_CHAIN_IDS]: CosSupportedChainIdsResponse;
  [COSMOS_METHOD_TYPE.COS__ACTIVATED_CHAIN_NAMES]: CosActivatedChainNamesResponse;
  [COSMOS_METHOD_TYPE.COS__ACTIVATED_CHAIN_IDS]: CosActivatedChainIdsResponse;
  [COSMOS_METHOD_TYPE.COS__ACCOUNT]: CosAccountResponse;
  [COSMOS_METHOD_TYPE.COS__SIGN_AMINO]: CosSignAminoResponse;
  [COSMOS_METHOD_TYPE.COS__REQUEST_ACCOUNT]: CosRequestAccountResponse;
  [COSMOS_METHOD_TYPE.COS__REQUEST_ACCOUNTS]: CosRequestAccountsResponse;
  [COSMOS_METHOD_TYPE.COS__REQUEST_ACCOUNTS_SETTLED]: CosRequestAccountsSettledResponse;
  [COSMOS_METHOD_TYPE.COS__ADD_CHAIN]: CosRequestAddChainResponse;
  [COSMOS_METHOD_TYPE.COS__SIGN_DIRECT]: CosSignDirectResponse;
  [COSMOS_METHOD_TYPE.COS__SEND_TRANSACTION]: CosSendTransactionResponse;
  [COSMOS_METHOD_TYPE.COS__SIGN_MESSAGE]: CosSignMessageResponse;
  [COSMOS_METHOD_TYPE.COS__VERIFY_MESSAGE]: CosVerifyMessageResponse;
  [COSMOS_METHOD_TYPE.COS__ADD_NFTS_CW721]: CosAddNFTsCW721Response;
  [COSMOS_METHOD_TYPE.COS__GET_BALANCE_CW20]: CosGetBalanceCW20Response;
  [COSMOS_METHOD_TYPE.COS__GET_TOKEN_INFO_CW20]: CosGetTokenInfoCW20Response;
  [COSMOS_METHOD_TYPE.COS__ADD_TOKENS_CW20]: CosAddTokensCW20Response;
  [COSMOS_METHOD_TYPE.COS__ADD_TOKENS_CW20_INTERNAL]: CosAddTokensCW20Response;
}

export interface CosSupportedChainNames extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__SUPPORTED_CHAIN_NAMES;
  params?: undefined;
}

export interface CosSupportedChainNamesResponse {
  official: string[];
  unofficial: string[];
}

export interface CosSupportedChainIds extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__SUPPORTED_CHAIN_IDS;
  params?: undefined;
}

export interface CosSupportedChainIdsResponse {
  official: string[];
  unofficial: string[];
}

export interface CosActivatedChainNames extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__ACTIVATED_CHAIN_NAMES;
  params?: undefined;
}

export type CosActivatedChainNamesResponse = string[];

export interface CosActivatedChainIds extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__ACTIVATED_CHAIN_IDS;
  params?: undefined;
}

export type CosActivatedChainIdsResponse = string[];

export interface CosAccount extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__ACCOUNT;
  params: { chainName: string };
  id?: number | string;
}

export interface CosAccountResponse {
  publicKey: string;
  address: string;
  name: string;
  isLedger: boolean;
  isEthermint: boolean;
}

export interface CosAccountResponseWithChainId {
  chainId: string;
  publicKey: string;
  address: string;
  name: string;
  isLedger: boolean;
  isEthermint: boolean;
}

export type CosAccountsResponse = CosAccountResponse[];

export interface CosSendTransactionParams {
  chainName: string;
  txBytes: string;
  mode: number;
}

export interface CosSendTransaction extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__SEND_TRANSACTION;
  params: CosSendTransactionParams;
}

export type CosSendTransactionResponse = SendTransactionPayload;

export interface CosGetBalanceCW20Params {
  chainName: string;
  contractAddress: string;
  address: string;
}

// popup

export interface CosRequestAccount extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__REQUEST_ACCOUNT;
  params: { chainName: string };
}

export interface CosRequestAccounts extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__REQUEST_ACCOUNTS;
  params: { chainIds: string[] };
}

export interface CosRequestAccountsSettled extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__REQUEST_ACCOUNTS_SETTLED;
  params: { chainIds: string[] };
}

export interface CosAddChainParams {
  type?: CosmosType;
  chainId: string;
  chainName: string;
  restURL: string;
  imageURL?: string;
  tokenImageURL?: string;
  baseDenom: string;
  displayDenom: string;
  decimals?: number;
  coinType?: string;
  addressPrefix: string;
  coinGeckoId?: string;
  gasRate?: AddChainGasRate;
  sendGas?: string;
  cosmWasm?: boolean;
}

export interface CosRequestAddChain extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__ADD_CHAIN;
  params: CosAddChainParams;
}

export type CosRequestAccountResponse = CosAccountResponse;

export type CosRequestAccountsResponse = CosAccountsResponse;

export type SettledResponse<T> =
  | {
      status: 'fulfilled';
      value: T;
    }
  | {
      status: 'rejected';
      reason: Error;
    };
export type SettledResponses<T> = SettledResponse<T>[];

export type CosRequestAccountsSettledResponse = SettledResponses<CosAccountResponseWithChainId>;

export type CosRequestAddChainResponse = boolean;

export interface CosSignOptions {
  isEditMemo?: boolean;
  isEditFee?: boolean;
  isCheckBalance?: boolean;
}

export interface CosSignAminoParams extends CosSignOptions {
  chainName: string;
  doc: SignAminoDoc;
  signer?: string;
}

export interface CosSignAmino extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__SIGN_AMINO;
  params: CosSignAminoParams;
}

export interface CosSignAminoResponse {
  signature: string;
  pub_key: {
    type: PublicKeyType;
    value: string;
  };
  signed_doc: SignAminoDoc;
}

export interface CosSignDirectParams extends CosSignOptions {
  chainName: string;
  doc: SignDirectDoc;
}

export interface CosSignDirect extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__SIGN_DIRECT;
  params: CosSignDirectParams;
}

export interface CosSignDirectResponse {
  signature: string;
  pub_key: {
    type: PublicKeyType;
    value: string;
  };
  signed_doc: SignDirectDoc;
}

export interface CosAddTokensCW20Token {
  contractAddress: string;
  imageURL?: string;
  coinGeckoId?: string;
}

export interface CosAddTokensCW20Params {
  chainName: string;
  tokens: CosAddTokensCW20Token[];
}

export interface CosAddTokensCW20 extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__ADD_TOKENS_CW20;
  params: CosAddTokensCW20Params;
}

export type CosAddTokensCW20Response = null;

export interface CosAddTokensCW20InternalParams {
  chainName: string;
  tokens: CosmosCw20Asset[];
}
export interface CosAddTokensCW20Internal extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__ADD_TOKENS_CW20_INTERNAL;
  params: CosAddTokensCW20InternalParams;
}

export interface CosGetBalanceCW20Params {
  chainName: string;
  contractAddress: string;
  address: string;
}

export interface CosGetBalanceCW20 extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__GET_BALANCE_CW20;
  params: CosGetBalanceCW20Params;
}

export type CosGetBalanceCW20Response = string;

export interface CosGetTokenInfoCW20Params {
  chainName: string;
  contractAddress: string;
}

export interface CosGetTokenInfoCW20 extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__GET_TOKEN_INFO_CW20;
  params: CosGetTokenInfoCW20Params;
}

export interface CosGetTokenInfoCW20Response {
  name: string;
  symbol: string;
  decimals: number;
  total_supply: string;
}

export interface CosAddNFTsCW721NFT {
  contractAddress: string;
  tokenId: string;
}

export interface CosAddNFTsCW721Params {
  chainName: string;
  nfts: CosAddNFTsCW721NFT[];
}

export interface CosAddNFTsCW721 extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__ADD_NFTS_CW721;
  params: CosAddNFTsCW721Params;
}

export type CosAddNFTsCW721Response = null;

export interface CosSignMessageParams {
  chainName: string;
  message: string;
  signer: string;
}

export interface CosSignMessage extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__SIGN_MESSAGE;
  params: CosSignMessageParams;
}

export interface CosSignMessageResponse {
  signature: string;
  pub_key: PubKey;
}

export interface CosVerifyMessageParams {
  chainName: string;
  message: string;
  signer: string;
  publicKey: string;
  signature: string;
}

export interface CosVerifyMessage extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__VERIFY_MESSAGE;
  params: CosVerifyMessageParams;
}

export type CosVerifyMessageResponse = boolean;

export interface CosDisconnect extends RequestBase {
  chainType: Extract<ChainType, 'cosmos'>;
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__DISCONNECT;
  params: CosVerifyMessageParams;
}

export interface SendTransaction {
  code: number;
  txhash: string;
  raw_log?: unknown;
  codespace?: unknown;
  tx?: unknown;
  log?: unknown;
  info?: unknown;
  height?: unknown;
  gas_wanted?: unknown;
  gas_used?: unknown;
  events?: unknown;
  data?: unknown;
  timestamp?: unknown;
}

export interface SendTransactionPayload {
  tx_response: SendTransaction;
}
