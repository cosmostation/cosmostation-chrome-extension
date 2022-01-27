import type {
  ETHEREUM_METHOD_TYPE,
  ETHEREUM_NO_POPUP_METHOD_TYPE,
  ETHEREUM_POPUP_METHOD_TYPE,
} from '~/constants/ethereum';

export type EthereumNoPopupMethodType = ValueOf<typeof ETHEREUM_NO_POPUP_METHOD_TYPE>;
export type EthereumPopupMethodType = ValueOf<typeof ETHEREUM_POPUP_METHOD_TYPE>;

export type EthSignRequestMessage = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__SIGN | typeof ETHEREUM_METHOD_TYPE.PERSONAL_SIGN;
  params: string[];
  id?: number | string;
};

export type EthGetBalanceRequestMessage = {
  method: typeof ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE;
  params: string[];
  id?: number | string;
};

export type EthRPCRequestMessage = {
  method: Exclude<EthereumNoPopupMethodType, typeof ETHEREUM_METHOD_TYPE.ETH__GET_BALANCE>;
  params: unknown;
  id?: number | string;
};
