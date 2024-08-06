import type { LINE_TYPE } from '~/constants/chain';
import type { COSMOS_TYPE, TOKEN_TYPE as COSMOS_TOKEN_TYPE } from '~/constants/cosmos';
import type { TOKEN_TYPE as ETHEREUM_TOKEN_TYPE } from '~/constants/ethereum';

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
  chainName: string;
  bip44: Omit<BIP44, 'addressIndex'>;
  tokenImageURL?: string;
  imageURL?: string;
};

export type GasRate = {
  tiny: string;
  low: string;
  average: string;
};

export type GasRateKey = keyof GasRate;

export type Gas = {
  send?: string;
  ibcSend?: string;
  transfer?: string;
  ibcTransfer?: string;
};

export type CosmosChain = {
  line: typeof LINE_TYPE.COSMOS;
  isTerminated?: boolean;
  type: CosmosType;
  chainId: string;
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
  cosmWasm?: boolean;
  custom?: 'no-stake';
} & CommonChain;

export type CosmosCW20Token = {
  id: string;
  chainId: CosmosChain['id'];
  tokenType: typeof COSMOS_TOKEN_TYPE.CW20;
  address: string;
  name?: string;
  displayDenom: string;
  decimals: number;
  imageURL?: string;
  coinGeckoId?: string;
  default?: boolean;
};

export type CosmosToken = CosmosCW20Token;

export type CosmosGasRate = {
  chainId: string;
  baseDenom: string;
  originDenom: string;
  gasRate: GasRate;
};

export type Coin = {
  type: string;
  originBaseDenom: string;
  baseDenom: string;
  decimals: number;
  displayDenom: string;
  imageURL?: string;
  coinGeckoId?: string;
};

export type FeeCoin = {
  originBaseDenom?: string;
  baseDenom: string;
  displayDenom: string;
  decimals: number;
  coinGeckoId?: string;
  imageURL?: string | undefined;
  availableAmount: string;
  gasRate?: GasRate;
};

export type EthereumChain = {
  line: typeof LINE_TYPE.ETHEREUM;
} & CommonChain;

export type EthereumNetwork = {
  id: string;
  chainId: string;
  networkName: string;
  displayDenom: string;
  decimals: number;
  rpcURL: string;
  tokenImageURL?: string;
  imageURL?: string;
  explorerURL?: string;
  coinGeckoId?: string;
};

export type AptosChain = {
  line: typeof LINE_TYPE.APTOS;
} & CommonChain;

export type SuiChain = {
  line: typeof LINE_TYPE.SUI;
  chainName: string;
} & CommonChain;

export type AptosNetwork = {
  id: string;
  chainId: number;
  networkName: string;
  restURL: string;
  tokenImageURL?: string;
  imageURL?: string;
  explorerURL?: string;
  coinGeckoId?: string;
};

export type SuiNetwork = {
  id: string;
  networkName: string;
  rpcURL: string;
  displayDenom: string;
  tokenImageURL?: string;
  imageURL?: string;
  explorerURL?: string;
  coinGeckoId?: string;
  decimals: number;
};

export type EthereumERC20Token = {
  id: string;
  ethereumNetworkId: string;
  tokenType: typeof ETHEREUM_TOKEN_TYPE.ERC20;
  address: string;
  name?: string;
  displayDenom: string;
  decimals: number;
  imageURL?: string;
  coinGeckoId?: string;
  default?: boolean;
};

export type Chain = CosmosChain | EthereumChain | AptosChain | SuiChain;

export type EthereumToken = EthereumERC20Token;
