import type { COSMOS_NO_POPUP_METHOD_TYPE, COSMOS_POPUP_METHOD_TYPE } from '~/constants/cosmos';
import type { CosmosType, GasRate } from '~/types/chain';
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
};

export type CosAddChain = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__ADD_CHAIN | typeof COSMOS_POPUP_METHOD_TYPE.TEN__ADD_CHAIN;
  params: CosAddChainParams;
  id?: number | string;
};

export type CosAddChainResponse = boolean;

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
