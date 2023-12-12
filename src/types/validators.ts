export type ValidatorAddress = {
  address: string;
  operatorAddress: string;
  signType: 'amino' | 'protobuf';
};
export type ValidatorAddressPayload = ValidatorAddress[];
