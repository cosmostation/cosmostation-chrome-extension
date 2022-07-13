import type { LINE_TYPE } from '~/constants/chain';
import type { COSMOS_TYPE } from '~/constants/cosmos';
import type { TOKEN_TYPE } from '~/constants/ethereum';

export type LineType = ValueOf<typeof LINE_TYPE>;

export type CosmosType = ValueOf<typeof COSMOS_TYPE>;

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

export type CosmosChain = {
  line: typeof LINE_TYPE.COSMOS;
  type: CosmosType;
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
  originBaseDenom: string;
  baseDenom: string;
  decimals: number;
  displayDenom: string;
  imageURL?: string;
};

export type FeeCoin = {
  originBaseDenom: string;
  baseDenom: string;
  displayDenom: string;
  decimals: number;
};

export type EthereumChain = {
  line: typeof LINE_TYPE.ETHEREUM;
  chainName: string;
} & CommonChain;

export type EthereumNetwork = {
  id: string;
  chainId: string;
  networkName: string;
  displayDenom: string;
  decimals: number;
  rpcURL: string;
  imageURL?: string;
  explorerURL?: string;
  coinGeckoId?: string;
};

export type EthereumERC20Token = {
  id: string;
  ethereumNetworkId: string;
  tokenType: typeof TOKEN_TYPE.ERC20;
  address: string;
  name?: string;
  displayDenom: string;
  decimals: number;
  imageURL?: string;
  coinGeckoId?: string;
};

export type Chain = CosmosChain | EthereumChain;

export type EthereumToken = EthereumERC20Token;
