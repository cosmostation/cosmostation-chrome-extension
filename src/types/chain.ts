import type { LINE_TYPE } from '~/constants/chain';

export type LineType = ValueOf<typeof LINE_TYPE>;

export type BIP44 = {
  purpose: string;
  coinType: string;
  account: string;
  change: string;
  addressIndex: string;
};

type CommonChain = {
  id: string;
  chainId: string;
  chainName: string;
  displayDenom: string;
  bip44: Omit<BIP44, 'addressIndex'>;
};

export type CosmosChain = {
  line: typeof LINE_TYPE.COSMOS;
  restURL: string;
  baseDenom: string;
  decimal: number;
  bech32Prefix: {
    address: string;
  };
} & CommonChain;

export type EthereumChain = {
  line: typeof LINE_TYPE.ETHEREUM;
  rpcURL: string;
  explorerURL?: string;
} & CommonChain;

export type Chain = CosmosChain | EthereumChain;
