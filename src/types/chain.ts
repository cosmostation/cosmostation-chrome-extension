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
  bip44: Omit<BIP44, 'addressIndex'>;
};

export type CosmosChain = {
  line: typeof LINE_TYPE.COSMOS;
  chainId: string;
  chainName: string;
  displayDenom: string;
  restURL: string;
  baseDenom: string;
  decimal: number;
  bech32Prefix: {
    address: string;
  };
} & CommonChain;

export type EthereumChain = {
  line: typeof LINE_TYPE.ETHEREUM;
  chainName: string;
  networks: EthereumNetwork[];
} & CommonChain;

export type EthereumNetwork = {
  id: string;
  chainId: string;
  networkName: string;
  baseDenom: string;
  displayDenom: string;
  decimal: number;
  rpcURL: string;
  explorerURL?: string;
};

export type Chain = CosmosChain | EthereumChain;
