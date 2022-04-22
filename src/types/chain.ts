import type { LINE_TYPE, TENDERMINT_TYPE } from '~/constants/chain';

export type LineType = ValueOf<typeof LINE_TYPE>;

export type TendermintType = ValueOf<typeof TENDERMINT_TYPE>;

export type BIP44 = {
  purpose: string;
  coinType: string;
  account: string;
  change: string;
  addressIndex: string;
};

export type CommonChain = {
  id: string;
  bip44: Omit<BIP44, 'addressIndex'>;
  imageURL?: string;
};

export type GasRate = {
  tiny: string;
  low: string;
  average: string;
};

export type Gas = {
  send?: string;
};

export type TendermintChain = {
  line: typeof LINE_TYPE.TENDERMINT;
  type: TendermintType;
  chainId: string;
  chainName: string;
  baseDenom: string;
  displayDenom: string;
  restURL: string;
  decimals: number;
  bech32Prefix: {
    address: string;
  };
  coinGeckoId?: string;
  explorerURL?: string;
  gasRate: GasRate;
  gas: Gas;
} & CommonChain;

export type Coin = {
  baseDenom: string;
  decimals: number;
  displayDenom: string;
  imageURL: string;
};

export type EthereumChain = {
  line: typeof LINE_TYPE.ETHEREUM;
  chainName: string;
} & CommonChain;

export type EthereumNetwork = {
  id: string;
  ethereumChainId: string;
  chainId: string;
  networkName: string;
  baseDenom: string;
  displayDenom: string;
  decimals: number;
  rpcURL: string;
  imageURL?: string;
  explorerURL?: string;
  coinGeckoId?: string;
};

export type EthereumToken = {
  id: string;
  accountId: string;
  ethereumNetworkId: string;
  address: string;
  tokenName: string;
  decimals: number;
  imageURL?: string;
};

export type Chain = TendermintChain | EthereumChain;
