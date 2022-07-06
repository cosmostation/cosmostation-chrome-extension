import type { COSMOS_NO_POPUP_METHOD_TYPE, COSMOS_POPUP_METHOD_TYPE } from '~/constants/cosmos';
import type { CosmosType, GasRate } from '~/types/chain';
import type { PublicKeyType } from '~/types/cosmos';
import type { SignAminoDoc } from '~/types/cosmos/amino';
import type { SignDirectDoc } from '~/types/cosmos/proto';

export type CosmosNoPopupMethodType = ValueOf<typeof COSMOS_NO_POPUP_METHOD_TYPE>;
export type CosmosPopupMethodType = ValueOf<typeof COSMOS_POPUP_METHOD_TYPE>;

// no popup

export type TenSupportedChainNames = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.TEN__SUPPORTED_CHAIN_NAMES;
  params?: undefined;
  id?: number | string;
};

export type TenAccount = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.TEN__ACCOUNT;
  params: { chainName: string };
  id?: number | string;
};

export type TenAccountResponse = { publicKey: Uint8Array; address: string; name: string };

// popup

export type TenRequestAccount = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.TEN__REQUEST_ACCOUNT;
  params: { chainName: string };
  id?: number | string;
};

export type TenRequestAccountResponse = TenAccountResponse;

export type TenAddChainParams = {
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

export type TenAddChain = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.TEN__ADD_CHAIN;
  params: TenAddChainParams;
  id?: number | string;
};

export type TenAddChainResponse = boolean;

export type TenSignOptions = { isEditMemo?: boolean; isEditFee?: boolean; gasRate?: GasRate };

export type TenSignAminoParams = { chainName: string; doc: SignAminoDoc } & TenSignOptions;

export type TenSignAmino = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.TEN__SIGN_AMINO;
  params: TenSignAminoParams;
  id?: number | string;
};

export type TenSignAminoResponse = {
  signature: string;
  pub_key: {
    type: PublicKeyType;
    value: string;
  };
  signed_doc: SignAminoDoc;
};

export type TenSignDirectParams = { chainName: string; doc: SignDirectDoc } & TenSignOptions;

export type TenSignDirect = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.TEN__SIGN_DIRECT;
  params: TenSignDirectParams;
  id?: number | string;
};

export type TenSignDirectResponse = {
  signature: string;
  pub_key: {
    type: PublicKeyType;
    value: string;
  };
  signed_doc: SignDirectDoc;
};
