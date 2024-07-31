import type { cosmos } from '~/proto/cosmos-sdk-v0.47.4.js';

export type ProtoBuilderDecodeResponse = {
  auth_info: cosmos.tx.v1beta1.AuthInfo;
  body: cosmos.tx.v1beta1.TxBody;
};
