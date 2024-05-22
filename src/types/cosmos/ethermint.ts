import type { MessageTypeProperty } from '@metamask/eth-sig-util';

export type EIP712TypeDescriptors = Record<string, MessageTypeProperty[] | undefined>;

export type EIP712StructuredData = {
  types: EIP712TypeDescriptors;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  domain: Record<string, any>;
  primaryType: string;
};

export type RLPTypes = Record<
  string,
  Array<{
    name: string;
    type: string;
  }>
>;
