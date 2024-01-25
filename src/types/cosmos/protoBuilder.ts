import type { cosmos } from '~/proto/cosmos-v0.44.2';

export type ProtoBuilderDecodeResponse = {
  auth_info: cosmos.tx.v1beta1.AuthInfo;
  body: cosmos.tx.v1beta1.TxBody;
};
