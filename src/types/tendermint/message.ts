import type { TENDERMINT_NO_POPUP_METHOD_TYPE, TENDERMINT_POPUP_METHOD_TYPE } from '~/constants/tendermint';
import type { GasRate } from '~/types/chain';
import type { SignDirectDoc } from '~/types/tendermint';
import type { SignAminoDoc } from '~/types/tendermint/amino';

export type TendermintNoPopupMethodType = ValueOf<typeof TENDERMINT_NO_POPUP_METHOD_TYPE>;
export type TendermintPopupMethodType = ValueOf<typeof TENDERMINT_POPUP_METHOD_TYPE>;

export type TenSupportedChainNames = {
  method: typeof TENDERMINT_POPUP_METHOD_TYPE.TEN__SUPPORTED_CHAIN_NAMES;
  params?: undefined;
  id?: number | string;
};

export type TenRequestAccounts = {
  method: typeof TENDERMINT_POPUP_METHOD_TYPE.TEN__REQUEST_ACCOUNTS;
  params: { chainName: string };
  id?: number | string;
};

export type TenAddChainParams = {
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
  method: typeof TENDERMINT_POPUP_METHOD_TYPE.TEN__ADD_CHAIN;
  params: TenAddChainParams;
  id?: number | string;
};

export type TenSignAminoParams = { chainName: string; doc: SignAminoDoc; isEditMemo?: boolean; isEditFee?: boolean };

export type TenSignAmino = {
  method: typeof TENDERMINT_POPUP_METHOD_TYPE.TEN__SIGN_AMINO;
  params: TenSignAminoParams;
  id?: number | string;
};

export type TenSignDirect = {
  method: typeof TENDERMINT_POPUP_METHOD_TYPE.TEN__SIGN_DIRECT;
  params: { chainName: string; doc: SignDirectDoc };
  id?: number | string;
};

export type TenTest = {
  method: typeof TENDERMINT_POPUP_METHOD_TYPE.TEN__TEST;
  params: { ddd: Uint8Array };
  id?: number | string;
};
