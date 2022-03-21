import type { TENDERMINT_NO_POPUP_METHOD_TYPE, TENDERMINT_POPUP_METHOD_TYPE } from '~/constants/tendermint';

export type TendermintNoPopupMethodType = ValueOf<typeof TENDERMINT_NO_POPUP_METHOD_TYPE>;
export type TendermintPopupMethodType = ValueOf<typeof TENDERMINT_POPUP_METHOD_TYPE>;

export type TenRequestAccounts = {
  method: typeof TENDERMINT_POPUP_METHOD_TYPE.TEN__REQUEST_ACCOUNTS;
  params?: unknown;
  id?: number | string;
};
