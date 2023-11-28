import type { CosmosChain, EthereumNetwork, EthereumToken } from '../chain';
import type { AssetV3 } from '../cosmos/asset';

export type IntegratedSwapEVMChain = EthereumNetwork & { line: 'ETHEREUM'; baseChainUUID: string };

export type IntegratedSwapCosmosChain = CosmosChain & { baseChainUUID: string; networkName: string };

export type IntegratedSwapChain = (IntegratedSwapEVMChain | IntegratedSwapCosmosChain) & { isUnavailable?: boolean };

export type IntegratedSwapCosmosToken = AssetV3 & {
  address: string;
  balance?: string;
  displayDenom: string;
  imageURL?: string;
  name: string;
};

export type IntegratedSwapEVMToken = Omit<EthereumToken, 'id' | 'ethereumNetworkId' | 'tokenType'> & {
  balance?: string;
  name: string;
};

export type IntegratedSwapToken = IntegratedSwapEVMToken | IntegratedSwapCosmosToken;

export type SquidTokensPayload = {
  mainnet: SupportNetwork[];
  testnet: SupportNetwork[];
};

export type SupportNetwork = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  contracts: Contract[];
};

export type Contract = {
  chain: string;
  address: string;
  symbol: string;
  decimals: number;
  transfer_fee: number;
};

export type SupportSwapChainPayload = {
  oneInch: SupportedChain;
  squid: SupportedChain;
};

export type SupportedChain = {
  evm: ChainData;
  cosmos: ChainData;
};

export type SupportedSkipChain = {
  chains: {
    chain_name: string;
    chain_id: string;
    pfm_enabled?: boolean;
    cosmos_sdk_version: string;
    modules: {
      [modulePath: string]: {
        path: string;
        version: string;
        sum?: string;
      };
    };
  }[];
};

export type SupportedSkipAsset = {
  denom: string;
  chain_id: string;
  origin_denom: string;
  origin_chain_id: string;
  trace: string;
  symbol: string;
  name: string;
  logo_uri: string;
  decimals: number;
};

export type SupportedSkipToken = {
  chain_to_assets_map: {
    [key: string]: {
      assets: SupportedSkipAsset[];
    };
  };
};

export type ChainData = {
  send: ChainIdData[];
  receive: ChainIdData[];
};

export type ChainIdData = {
  chainId: string;
};
