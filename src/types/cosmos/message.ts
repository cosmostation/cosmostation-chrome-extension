import type { COSMOS_NO_POPUP_METHOD_TYPE, COSMOS_POPUP_METHOD_TYPE } from '~/constants/cosmos';
import type { CosmosToken, CosmosType, GasRate } from '~/types/chain';
import type { PublicKeyType } from '~/types/cosmos';
import type { SignAminoDoc } from '~/types/cosmos/amino';
import type { SignDirectDoc } from '~/types/cosmos/proto';

export type CosmosNoPopupMethodType = ValueOf<typeof COSMOS_NO_POPUP_METHOD_TYPE>;
export type CosmosPopupMethodType = ValueOf<typeof COSMOS_POPUP_METHOD_TYPE>;

// no popup

export type CosSupportedChainNames = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__SUPPORTED_CHAIN_NAMES | typeof COSMOS_NO_POPUP_METHOD_TYPE.TEN__SUPPORTED_CHAIN_NAMES;
  params?: undefined;
  id?: number | string;
};

export type CosSupportedChainNamesResponse = {
  official: string[];
  unofficial: string[];
};

export type CosActivatedChainNames = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__ACTIVATED_CHAIN_NAMES;
  params?: undefined;
  id?: number | string;
};

export type CosActivatedChainNamesResponse = string[];

export type CosAccount = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__ACCOUNT | typeof COSMOS_NO_POPUP_METHOD_TYPE.TEN__ACCOUNT;
  params: { chainName: string };
  id?: number | string;
};

export type CosAccountResponse = { publicKey: Uint8Array; address: string; name: string };

export type CosSendTransactionParams = {
  chainName: string;
  txBytes: string;
  mode: number;
};

export type CosSendTransaction = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__SEND_TRANSACTION;
  params: CosSendTransactionParams;
  id?: number | string;
};

export type CosGetBalanceCW20Params = {
  chainName: string;
  contractAddress: string;
  address: string;
};

export type CosGetBalanceCW20 = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__GET_BALANCE_CW20;
  params: CosGetBalanceCW20Params;
  id?: number | string;
};

export type CosGetTokenInfoCW20Params = {
  chainName: string;
  contractAddress: string;
};

export type CosGetTokenInfoCW20 = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__GET_TOKEN_INFO_CW20;
  params: CosGetTokenInfoCW20Params;
  id?: number | string;
};

// popup

export type CosRequestAccount = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__REQUEST_ACCOUNT | typeof COSMOS_POPUP_METHOD_TYPE.TEN__REQUEST_ACCOUNT;
  params: { chainName: string };
  id?: number | string;
};

export type CosRequestAccountResponse = CosAccountResponse;

export type CosAddChainParams = {
  type?: CosmosType;
  chainId: string;
  chainName: string;
  restURL: string;
  imageURL?: string;
  baseDenom: string;
  displayDenom: string;
  decimals?: number;
  coinType?: string;
  addressPrefix: string;
  coinGeckoId?: string;
  gasRate?: GasRate;
  sendGas?: string;
  cosmWasm?: boolean;
};

export type CosAddChain = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__ADD_CHAIN | typeof COSMOS_POPUP_METHOD_TYPE.TEN__ADD_CHAIN;
  params: CosAddChainParams;
  id?: number | string;
};

export type CosAddChainResponse = boolean;

export type CosSetAutoSignParams = {
  chainName: string;
  duration: number;
};

export type CosSetAutoSign = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__SET_AUTO_SIGN;
  params: CosSetAutoSignParams;
  id?: number | string;
};

export type CosSetAutoSignResponse = null;

export type CosGetAutoSignParams = {
  chainName: string;
};

export type CosGetAutoSign = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__GET_AUTO_SIGN;
  params: CosGetAutoSignParams;
  id?: number | string;
};

export type CosGetAutoSignResponse = number | null;

export type CosDeleteAutoSignParams = {
  chainName: string;
};

export type CosDeleteAutoSign = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__DELETE_AUTO_SIGN;
  params: CosDeleteAutoSignParams;
  id?: number | string;
};

export type CosDeleteAutoSignResponse = null;

export type CosSignOptions = { isEditMemo?: boolean; isEditFee?: boolean; gasRate?: GasRate };

export type CosSignAminoParams = { chainName: string; doc: SignAminoDoc } & CosSignOptions;

export type CosSignAmino = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__SIGN_AMINO | typeof COSMOS_POPUP_METHOD_TYPE.TEN__SIGN_AMINO;
  params: CosSignAminoParams;
  id?: number | string;
};

export type CosSignAminoResponse = {
  signature: string;
  pub_key: {
    type: PublicKeyType;
    value: string;
  };
  signed_doc: SignAminoDoc;
};

export type CosSignDirectParams = { chainName: string; doc: SignDirectDoc } & CosSignOptions;

export type CosSignDirect = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__SIGN_DIRECT | typeof COSMOS_POPUP_METHOD_TYPE.TEN__SIGN_DIRECT;
  params: CosSignDirectParams;
  id?: number | string;
};

export type CosSignDirectResponse = {
  signature: string;
  pub_key: {
    type: PublicKeyType;
    value: string;
  };
  signed_doc: SignDirectDoc;
};

export type CosAddTokensCW20Token = {
  contractAddress: string;
  imageURL?: string;
  coinGeckoId?: string;
};

export type CosAddTokensCW20Params = {
  chainName: string;
  tokens: CosAddTokensCW20Token[];
};

export type CosAddTokensCW20 = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__ADD_TOKENS_CW20;
  params: CosAddTokensCW20Params;
  id?: number | string;
};

export type CosAddTokensCW20Response = null;

export type CosAddTokensCW20InternalParams = {
  chainName: string;
  tokens: CosmosToken[];
};

export type CosAddTokensCW20Internal = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__ADD_TOKENS_CW20_INTERNAL;
  params: CosAddTokensCW20InternalParams;
  id?: number | string;
};
