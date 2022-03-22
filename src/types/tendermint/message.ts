import type { TENDERMINT_NO_POPUP_METHOD_TYPE, TENDERMINT_POPUP_METHOD_TYPE } from '~/constants/tendermint';
import type { GasRate } from '~/types/chain';

export type TendermintNoPopupMethodType = ValueOf<typeof TENDERMINT_NO_POPUP_METHOD_TYPE>;
export type TendermintPopupMethodType = ValueOf<typeof TENDERMINT_POPUP_METHOD_TYPE>;

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
