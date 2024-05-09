import type { COSMOS_NO_POPUP_METHOD_TYPE, COSMOS_POPUP_METHOD_TYPE } from '~/constants/message/cosmos';
import type { CosmosToken, CosmosType, GasRate } from '~/types/chain';
import type { PublicKeyType } from '~/types/cosmos';
import type { SignAminoDoc } from '~/types/cosmos/amino';
import type { SendTransactionPayload } from '~/types/cosmos/common';
import type { PubKey, SignDirectDoc } from '~/types/cosmos/proto';

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

export type CosSupportedChainIds = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__SUPPORTED_CHAIN_IDS;
  params?: undefined;
  id?: number | string;
};

export type CosSupportedChainIdsResponse = {
  official: string[];
  unofficial: string[];
};

export type CosActivatedChainNames = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__ACTIVATED_CHAIN_NAMES;
  params?: undefined;
  id?: number | string;
};

export type CosActivatedChainNamesResponse = string[];

export type CosActivatedChainIds = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__ACTIVATED_CHAIN_IDS;
  params?: undefined;
  id?: number | string;
};

export type CosActivatedChainIdsResponse = string[];

export type CosAccount = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__ACCOUNT | typeof COSMOS_NO_POPUP_METHOD_TYPE.TEN__ACCOUNT;
  params: { chainName: string };
  id?: number | string;
};

export type CosAccountResponse = { publicKey: string; address: string; name: string; isLedger: boolean; isEthermint: boolean };

export type CosAccountsResponse = CosAccountResponse[];

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

export type CosSendTransactionResponse = SendTransactionPayload;

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

export type CosVerifyMessageParams = {
  chainName: string;
  message: string;
  signer: string;
  publicKey: string;
  signature: string;
};

export type CosVerifyMessage = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__VERIFY_MESSAGE;
  params: CosVerifyMessageParams;
  id?: number | string;
};

export type CosVerifyMessageResponse = boolean;

export type CosDisconnect = {
  method: typeof COSMOS_NO_POPUP_METHOD_TYPE.COS__DISCONNECT;
  params: undefined;
  id?: number | string;
};

export type CosDisconnectResponse = null;

// popup

export type CosRequestAccount = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__REQUEST_ACCOUNT | typeof COSMOS_POPUP_METHOD_TYPE.TEN__REQUEST_ACCOUNT;
  params: { chainName: string };
  id?: number | string;
};

export type CosRequestAccounts = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__REQUEST_ACCOUNTS;
  params: { chainIds: string[] };
  id?: number | string;
};

export type CosRequestAccountResponse = CosAccountResponse;

export type CosRequestAccountsResponse = CosAccountsResponse;

export type CosAddChainParams = {
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

export type CosSignOptions = {
  isEditMemo?: boolean;
  isEditFee?: boolean;
  isCheckBalance?: boolean;
  gasRate?: GasRate;
};

export type CosSignAminoParams = { chainName: string; doc: SignAminoDoc; signer?: string } & CosSignOptions;

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

export type CosAddNFTsCW721NFT = {
  contractAddress: string;
  tokenId: string;
};

export type CosAddNFTsCW721Params = {
  chainName: string;
  nfts: CosAddNFTsCW721NFT[];
};

export type CosAddNFTsCW721 = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__ADD_NFTS_CW721;
  params: CosAddNFTsCW721Params;
  id?: number | string;
};

export type CosAddNFTsCW721Response = null;

export type CosSignMessageParams = {
  chainName: string;
  message: string;
  signer: string;
};

export type CosSignMessage = {
  method: typeof COSMOS_POPUP_METHOD_TYPE.COS__SIGN_MESSAGE;
  params: CosSignMessageParams;
  id?: number | string;
};

export type CosSignMessageResponse = {
  signature: string;
  pub_key: PubKey;
};
